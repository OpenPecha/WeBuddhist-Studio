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