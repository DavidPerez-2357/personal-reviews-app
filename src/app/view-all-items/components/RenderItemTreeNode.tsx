import ItemOrOrigin from "@/shared/components/ItemOrOrigin";
import { ItemTreeNode } from "@/shared/dto/Item";
import { ArrowDown } from "lucide-react";

type TreeRenderProps = {
  node: ItemTreeNode;
};

const RenderItemTreeNode: React.FC<TreeRenderProps> = ({ node }) => {
  return (
    <div className="flex flex-col w-full">
      <ItemOrOrigin item={node.item} />

      {node.children.length !== 0 && node.level < 1 && (
        <div className="flex flex-col gap-4 pl-3 ml-2 mb-4 pt-4 border-l-2 border-[var(--ion-color-secondary)] w-full">
          {node.children.map(child => (
            <RenderItemTreeNode key={child.item.id} node={child} />
          ))}
        </div>
      )}

      {node.children.length !== 0 && node.level == 1 && (
        <div className="flex flex-col gap-2 pb-4 mb-4 pl-4 pt-4 bg-opacity-10 w-full">
          {node.children.map(child => (
            <RenderItemTreeNode key={child.item.id} node={child} />
          ))}
        </div>
      )}

      {node.children.length !== 0 && node.level >= 2 && (
        <div className="flex flex-col gap-2 pb-4 mb-4 pt-4 w-full">
          <ArrowDown className="text-[var(--ion-color-secondary)] mx-auto mb-2 cursor-pointer" size={25} strokeWidth={4} />
          {node.children.map(child => (
            <RenderItemTreeNode key={child.item.id} node={child} />
          ))}
        </div>
      )}
      
    </div>
  );
};

export default RenderItemTreeNode;
