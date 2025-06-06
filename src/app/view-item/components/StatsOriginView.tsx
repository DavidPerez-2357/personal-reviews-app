import { ItemDisplay } from "@/shared/dto/Item";
import { Star } from "lucide-react";

const StatOriginView = ({ items }: { items: ItemDisplay[] }) => {
  const averageRating: number =
    items.reduce((acc, item) => acc + item.last_rating, 0) / items.length;
  const numberOfItems: number = items.length;
  // Generar el mapa de estrellas de 1 a 5, aunque no haya items con ese rating
  const numberStarMap: Map<number, number> = new Map<number, number>(
    Array.from({ length: 5 }, (_, i) => [i + 1, 0])
  );
  items.forEach((item) => {
    const roundedRating = Math.round(item.last_rating);
    numberStarMap.set(roundedRating, (numberStarMap.get(roundedRating) || 0) + 1);
  });

  return (
    <div className="flex gap-4 w-full pl-4">
      <div className="flex flex-col items-center justify-center">
        <span className="flex items-center gap-2 justify-center text-3xl font-bold text-[var(--ion-text-color)]">
            {Number.isFinite(averageRating) ? averageRating.toFixed(1) : '0.0'} <Star size={35} color="var(--ion-color-primary-step-500)" className="inline" fill="var(--ion-color-primary-step-500)" />
        </span>
        <span className="text-lg text-[var(--ion-text-color)]">
          {numberOfItems} Items 
        </span>
      </div>

        <div className="flex flex-col justify-center w-full">
            {Array.from(numberStarMap.entries())
              .sort(([a], [b]) => b - a)
              .map(([rating, count]) => {
                // La barra más larga (mayor count) va al 100%, el resto en proporción
                const maxCount = Math.max(...numberStarMap.values());
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="w-6 text-right">{rating}</span>
                    <div className="flex-1 h-3 rounded">
                      <div
                        className="h-3 bg-[var(--ion-color-primary-step-500)] rounded"
                        style={{
                          width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%`,
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                    <span className="w-6 text-left">{count}</span>
                  </div>
                );
              })}
        </div>
    </div>
  );
};

export default StatOriginView;
