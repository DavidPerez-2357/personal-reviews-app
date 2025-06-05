import { ItemDisplay } from "../dto/Item";
import ItemCard from "./ItemCard";
import OriginCard from "./OriginCard";

interface ItemOrOriginProps {
    item: ItemDisplay;
}

const ItemOrOrigin = ({ item }: ItemOrOriginProps) => {
    if (!item.is_origin) {
        return (
            <ItemCard item={item} />
        )
    }

    return (
        <OriginCard item={item} />
    )
}

export default ItemOrOrigin;