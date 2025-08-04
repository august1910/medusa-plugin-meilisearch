export const addCategoriesBeadcrum = async (
    products: any,
    queryService: any
) => {
    // lấy tất cả categories
    const { data: categories } = await queryService.graph({
        entity: 'product_category',
        fields: ["id", "name", "description", "handle", "mpath", "is_active", "is_internal", "rank", "parent_category_id", "created_at", "updated_at", "deleted_at", "metadata"],
    });

    // map id -> object
    let mappedCategories = categories.reduce((acc, category) => {
        acc[category.id] = category;
        return acc;
    }, {});

    products.forEach((product) => {
        let categories = product.categories || [];
        if (categories.length > 0) {
            categories.forEach((category) => {
                const mpaths = category['mpath'].split('.') || [];
                mpaths.forEach((mpath) => {
                    const entityCategory = mappedCategories[mpath];
                    const name = entityCategory ? entityCategory['name'] ?? 'NOT_FOUND' : 'NOT_FOUND'
                    const handle = entityCategory ? entityCategory['handle'] ?? 'NOT_FOUND' : 'NOT_FOUND'
                    if (category['mpath_name'] == null) {
                        // thêm 2 field về name, handle để show deep menu
                        category['mpath_name'] = name;
                        category['mpath_handle'] = handle;
                    } else {
                        category['mpath_name'] += "<<___>>" + name;
                        category['mpath_handle'] += "<<___>>" + handle;
                    }
                })
            })
        }
    })
}