import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface User {
  id: string
  name: string
  email: string
  role: string
}

const users: User[] = [
  { id: "1", name: "Alex Chen", email: "alex@example.com", role: "Admin" },
  { id: "2", name: "Jordan Lee", email: "jordan@example.com", role: "Editor" },
  { id: "3", name: "Sam Rivera", email: "sam@example.com", role: "Viewer" },
  { id: "4", name: "Taylor Kim", email: "taylor@example.com", role: "Editor" },
]

export function UsersTable() {
  return (
    <Table>
      <TableCaption>Team members and their roles.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="text-right">Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell className="text-right">{user.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
