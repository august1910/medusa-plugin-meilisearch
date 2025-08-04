import { addPriceList } from './add-price-list'
import { addCategoriesBeadcrum } from './add-categories-beadcrum'

export const handleMoreInfo = async (
    products: any,
    queryService: any
) => {
    // lấy thông tin về price list
    await addPriceList(products, queryService);
    // lấy thông tin về deep menu category
    await addCategoriesBeadcrum(products, queryService);
}