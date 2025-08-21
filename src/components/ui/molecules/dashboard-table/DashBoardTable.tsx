import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../atoms/table"
import { Input } from "../../atoms/input"
import { Button } from "../../atoms/button"
import { Search } from "lucide-react"

const plans = [
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
  },
]

export function DashBoardTable() {

  return (
    <div className="w-full">
      <div className="mb-4 border w-fit  px-2 rounded-md border-gray-200 dark:border-[#313132] flex items-center ">
        <Search className="w-4 h-4" />
        <Input
          placeholder="Search Plan..."
          className="rounded-md border-none dark:bg-transparent px-4 shadow-none py-2"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[160px] font-bold">Cover Image</TableHead>
            <TableHead className="font-bold">Title</TableHead>
            <TableHead className="w-[100px] font-bold">Plan Days</TableHead>
            <TableHead className="w-[150px] font-bold">Plan Used</TableHead>
            <TableHead className="w-[150px] font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id} className=" hover:cursor-pointer">
              <TableCell>
                <img src={plan.coverImage} alt="cover" className="w-32 h-20 object-cover rounded-md" />
              </TableCell>
              <TableCell>
                <div className="font-semibold text-base">{plan.title}</div>
                <div className="text-xs text-muted-foreground max-w-2xl truncate">{plan.subtitle}</div>
              </TableCell>
              <TableCell>{plan.planDay}</TableCell>
              <TableCell>{plan.planUsed}</TableCell>
              <TableCell>
                <Button variant="destructive" className="w-20">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
  