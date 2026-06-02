exports.searchKey = (query) => `search:${query.q || ''}:${query.category || ''}:${query.provider || ''}`;
