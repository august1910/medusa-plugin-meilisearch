export const addPriceList = async (
    products: any,
    queryService: any
) => {
    // lấy thông tin về price list
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
        // get price set ids với variantIds
        const { data: product_variant_price_sets } = await queryService.graph({
            entity: 'product_variant_price_set',
            fields: ['variant_id', 'price_set_id'],
            filters: { variant_id: variantIds },
        });

        // nếu có product_variant_price_sets thì tiến hành lấy data trong price
        // price nào có price_list_id thì sẽ push tiếp vào mảng prices của variant
        // price_list_id nếu có giá thị thì đang thuộc 1 chương trình sale nào đó trong Price List
        if (product_variant_price_sets && product_variant_price_sets.length > 0) {
            let priceSetIds: string[] = [];
            let price_set_id_variant = {};
            product_variant_price_sets.forEach(({ price_set_id, variant_id}) => {
                priceSetIds.push(price_set_id)
                price_set_id_variant[variant_id] = price_set_id;
            })
            if (priceSetIds && priceSetIds.length > 0) {
                const { data: prices } = await queryService.graph({
                    entity: 'price',
                    fields: ["id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity"],
                    filters: {
                        price_set_id: priceSetIds,
                    },
                });

                // gán prices vào variants
                if (prices && prices.length > 0) {
                    products.forEach(product => {
                        let variants = product['variants'];
                        if (variants && variants.length > 0) {
                            variants.forEach(variant => {
                                let price_set_id = price_set_id_variant[variant['id']];
                                prices.forEach(price => {
                                    if (price['price_set_id'] === price_set_id && price['price_list_id'] != null && price['deleted_at'] == null) {
                                        variant['prices'].push(price)
                                    }
                                })
                            });
                        }
                    });
                }
            }
        }
    }
    // end lấy thông tin về price list
}
