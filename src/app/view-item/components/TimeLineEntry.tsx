import StarRating from "@/shared/components/StarRating"

interface TimelineEntry {
  date: string
  rating: number
  comment: string
}

const TimelineEntry: React.FC<{ entry: TimelineEntry }> = ({ entry }) => {
  return (
    <div className="relative flex mb-12">
      {/* Timeline marker */}
      <div className="absolute left-0 w-0.5 h-full bg-[var(--ion-text-color)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[var(--ion-text-color)] border-4 border-[var(--ion-background-color)]"></div>
      </div>

      {/* Content */}
      <div className="ml-8">
        <div className="text-[var(--ion-color-muted)] font-medium mb-2">{entry.date}</div>
        <StarRating 
            size={30}
            rating={entry.rating}
            setRating={() => {}}
        />
        <p className="text-[var(--ion-text-color)] mt-2 text-lg">{entry.comment}</p>
      </div>
    </div>
  )
}

export default TimelineEntry;