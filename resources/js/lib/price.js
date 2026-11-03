// Los precios por hora pueden ser una fracción de céntimo, por eso se muestran con 4 decimales.
export const fmtPrice = (value) => {
    const n = Number(value);
    return n >= 0.1 ? n.toFixed(2) : n.toFixed(4);
};

export const cycleUnit = (cycles, key) => cycles?.find((c) => c.key === key)?.unit ?? 'mes';

// Misma fórmula que Plan::defaultPrice() en el backend.
export const defaultCyclePrice = (monthly, cycle) => {
    const min = 10 ** -cycle.decimals;
    const value = Number((Number(monthly) * cycle.factor).toFixed(cycle.decimals));
    return Math.max(value, min);
};
