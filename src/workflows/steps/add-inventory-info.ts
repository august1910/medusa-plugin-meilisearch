export const addInventoryInfo = async (
    products: any,
    queryService: any
) => {
    // lấy thông tin về inventory level
    if (products && products.length > 0) {
        let variantIds: string[] = [];
        products.forEach(product => {
            let variants = product['variants'];
            if (variants && variants.length > 0) {
                variants.forEach((variant) => {
                    variantIds.push(variant.id);
                });
            }
        })
        // get product_variant_inventory_item với variantIds
        const { data: product_variant_inventory_items } = await queryService.graph({
            entity: 'product_variant_inventory_item',
            fields: ['variant_id', 'inventory_item_id'],
            filters: { variant_id: variantIds },
        });

        // nếu có product_variant_inventory_items thì tiến hành lấy data trong inventory_level
        if (product_variant_inventory_items && product_variant_inventory_items.length > 0) {
            let inventory_item_ids: string[] = [];
            let inventory_item_id_variant_id_map = {};
            product_variant_inventory_items.forEach(({ inventory_item_id, variant_id}) => {
                inventory_item_ids.push(inventory_item_id)
                inventory_item_id_variant_id_map[variant_id] = inventory_item_id;
            })
            if (inventory_item_ids && inventory_item_ids.length > 0) {
                const { data: inventory_levels } = await queryService.graph({
                    entity: 'inventory_level',
                    fields: ["inventory_item_id", "stocked_quantity", "reserved_quantity", "incoming_quantity"],
                    filters: {inventory_item_id: inventory_item_ids}
                });

                // gán inventory info vào variants
                if (inventory_levels && inventory_levels.length > 0) {
                    let inventory_level_map: any = {};
                    inventory_levels.forEach( inventory_level => {
                        inventory_level_map[inventory_level['inventory_item_id']] = inventory_level
                    })

                    products.forEach(product => {
                        let variants = product['variants'];
                        if (variants && variants.length > 0) {
                            variants.forEach(variant => {
                                let inventory_item_id = inventory_item_id_variant_id_map[variant['id']];
                                const inventory_level = inventory_level_map[inventory_item_id];
                                if(inventory_level){
                                    variant['inventory_quantity'] = inventory_level['stocked_quantity'] - inventory_level['reserved_quantity']
                                }
                            });
                        }
                    });
                }
            }
        }
    }
    // end lấy thông tin về inventory level
}
