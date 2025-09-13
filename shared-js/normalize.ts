const normalizeDomain = (target: string) => {
    let t = target.toLowerCase();

    if (t.endsWith('.'))
        t = t.substring(0, t.length - 1);

    return t;
};

export {
    normalizeDomain,
}