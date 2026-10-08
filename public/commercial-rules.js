// Pure rules shared by admin, public quote and Worker. All money is integer minor units.
export function promotionError(promo, clock = Date.now()) {
  if (!promo) return 'Invalid promotion code.';
  if (!['active', 'scheduled'].includes(promo.status)) return 'Promotion is not active.';
  if (promo.startsAt && Date.parse(promo.startsAt) > clock) return 'Promotion has not started.';
  if (promo.endsAt && Date.parse(promo.endsAt) < clock) return 'Promotion has expired.';
  if (promo.limit != null && promo.uses >= promo.limit) return 'Promotion usage limit reached.';
  return '';
}
export function calculateCommercial(items, promo = null, taxPercent = 0, frozenPlan = null) {
  const lineTotals = items.map(item => Math.max(0, Math.round(Math.round(Number(item.unitPrice) * 100) * Number(item.quantity)) - Math.round(Number(item.discount || 0) * 100)));
  const subtotalMinor = lineTotals.reduce((sum, value) => sum + value, 0);
  let allocations = items.map(() => 0);
  if (frozenPlan) allocations = items.map((item, index) => Math.min(lineTotals[index], Number(frozenPlan[item.sortOrder ?? index] || 0)));
  else if (promo) {
    const eligible = items.map((item, index) => ({ item, index })).filter(({item}) => promo.scope === 'all' || (promo.catalogIds || []).includes(item.catalogId) || item.category === promo.scope);
    if (promo.kind === 'free-item') {
      const target = eligible.find(({item}) => item.catalogId === promo.freeItemId) || (eligible.length && items.map((item,index)=>({item,index})).find(({item})=>item.catalogId === promo.freeItemId));
      if (eligible.length && target) allocations[target.index] = Math.min(lineTotals[target.index], Math.round(Number(target.item.unitPrice) * 100));
    } else if (promo.kind === 'percentage') eligible.forEach(({index}) => allocations[index] = Math.round(lineTotals[index] * Number(promo.value) / 100));
    else {
      const eligibleTotal = eligible.reduce((sum,{index}) => sum + lineTotals[index], 0);
      const amount = Math.min(eligibleTotal, Math.round(Number(promo.value) * 100));
      let remaining = amount;
      eligible.forEach(({index}, i) => { const part = i === eligible.length - 1 ? remaining : Math.min(remaining, Math.round(amount * lineTotals[index] / (eligibleTotal || 1))); allocations[index] = Math.min(lineTotals[index], part); remaining -= allocations[index]; });
      eligible.forEach(({index})=>{const extra=Math.min(remaining,lineTotals[index]-allocations[index]);allocations[index]+=extra;remaining-=extra;});
    }
  }
  const discountMinor = allocations.reduce((sum,value)=>sum+value,0);
  const taxMinor = Math.round((subtotalMinor - discountMinor) * Number(taxPercent) / 100);
  return { subtotalMinor, discountMinor, taxMinor, totalMinor: subtotalMinor - discountMinor + taxMinor, allocations };
}
