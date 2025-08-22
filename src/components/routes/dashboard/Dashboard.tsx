import { Input } from "@/components/ui/atoms/input"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/atoms/pagination"
import { DashBoardTable } from "@/components/ui/molecules/dashboard-table/DashBoardTable"
import { Search } from "lucide-react"
import { useState } from "react"
import { useDebounce } from "use-debounce"

const plansData= [
  {
    id: "1",
    coverImage: "https://ep-space.nyc3.cdn.digitaloceanspaces.com/app/uploads/2021/03/21161102/4-5dllc1155insidetengboche7-5x5cpywrt-2.jpg",
    title: "The 7 day buddhist Plan on Compassion",
    subtitle: "this plan is for the people to learn and study about compassion in a boarder context of how we perceive it. the greatest way to do this is to understand",
    planDay: "7 Days",
    planUsed: "30 Used",
  },
  {
    id: "2",
    coverImage: "https://static01.nyt.com/images/2023/09/28/multimedia/00mongolia-lama-explainer-kljz/00mongolia-lama-explainer-kljz-mediumSquareAt3X.jpg",
    title: "The 7 day buddhist Plan on Meditation",
    subtitle: "this plan is for the people to learn and study about compassion in a boarder context of how we perceive it. the greatest way to do this is to understand ",
    planDay: "7 Days",
    planUsed: "3 Used",
  },
  {
    id: "3",
    coverImage: "https://savetibet.org/wp-content/uploads/2019/06/shutterstock_1124150498-1000.jpg",
    title: "The 12 day buddhist Plan on Studying",
    subtitle: "this plan is for the people to learn and study about compassion in a boarder context of how we perceive it. the greatest way to do this is to understand ",
    planDay: "12 Days",
    planUsed: "10 Used",
  },
  {
    id: "4",
    coverImage: "https://tnp.org/wp-content/uploads/046__DHA8571_O_Adam.jpg",
    title: "The 12 day buddhist Plan on Pecha",
    subtitle: "this plan is for the people to learn and study about compassion in a boarder context of how we perceive it. the greatest way to do this is to understand .....",
    planDay: "12 Days",
    planUsed: "10 Used",
  }
]

const Dashboard = () => {
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebounce(search, 500)

  const filteredPlans = plansData.filter(plan =>
    plan.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    plan.subtitle.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  return (
    <div className="w-full h-full font-inter px-10 pt-10">
      <div className="mb-4 border w-fit  px-2 rounded-md border-gray-200 dark:border-[#313132] flex items-center ">
        <Search className="w-4 h-4" />
        <Input
          placeholder="Search Plan..."
          className="rounded-md border-none dark:bg-transparent px-4 shadow-none py-2"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>  
      <DashBoardTable plans={filteredPlans} />
      <Pagination className="mt-4">
        <PaginationPrevious/>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink>1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
        <PaginationNext/>
      </Pagination>
    </div>
  )
}

export default Dashboard