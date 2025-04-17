"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { User } from "lucide-react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { API_BASE_URL, apiClient, getRestaurantListforAdmin } from "@/services/apiService"
import { getMenuImagePath } from "@/utils/getImagePath"
import { toast } from "@/hooks/use-toast";
interface Restaurant {
  name: string;
  email: string;
  id: number,
  status: number
}
const ITEMS_PER_PAGE = 15
export default function RestaurantsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<Restaurant[]>([])
  const [currentPage, setCurrentPage] = useState(1)


  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await apiClient.get('/mobileUsers/getMobileUsers', {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      const usersResponse = await response.data
      setUsers(usersResponse.data)
    } catch (error) {
      console.error("Error during login:", error);
    }
  }
  useEffect(() => {


    fetchUsers()
  }, [])

  const filteredUsers = users?.filter(
    (restaurant) =>
      restaurant?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      restaurant?.email?.toLowerCase().includes(searchQuery?.toLowerCase())
  )
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )


  const handleInactiveAccount = async (id: number, userStatus: string) => {
    console.log(id, userStatus)
    const status = userStatus == "active" ? true : (userStatus === "inactive" ? false : null);
    console.log(status, "userStatus")
    try {
      const token = localStorage.getItem('token')
      const response = await apiClient.post(`/mobileUsers/updateMobileUserStatus/${id}`, { status }, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.data.success) {
        toast({
          title: "Users Updated",
          description: "Users Status  has been updated successfully",
        })
        fetchUsers()
      } else {
        throw new Error("Failed to add restaurant")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error adding the restaurant",
        variant: "destructive",
      })
      console.error("Error adding restaurant:", error)
    } finally {
      // setIsLoading(false)
    }
  }
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage your users</p>
        </div>

      </div>

      <div className="flex items-center gap-2 w-full">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedUsers?.map((users) => {
          return (
            <Card key={users.id} className="overflow-hidden"  >
              <div className="aspect-video w-full overflow-hidden flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <User className="text-gray-400" />
                </div>

              </div>

              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>

                    <h3 className="font-semibold text-lg">{users?.name}</h3>
                    <p className="text-sm text-muted-background">Email: {users?.email}</p>
                    <p >
                      Status:     <b className={`text-sm ${users?.status === 1 ? 'activeStatus' : 'inactiveStatus'} text-muted-background`}> {users?.status == 1 ? "Active" : "Inactive"}</b>
                    </p>

                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <div className="flex items-center gap-2">
                  {/* {users?.status === 1 ? <button onClick={() => handleInactiveAccount(users.id, "inactive")} style={{ color: "white", backgroundColor: "#f1582e" }} className="bg-red-500  px-3 py-1 rounded hover:bg-red-600 text-sm">
                    Inactive Account
                  </button> : <button onClick={() => handleInactiveAccount(users.id, "active")} style={{ color: "white", backgroundColor: "#f1582e" }} className="bg-red-500  px-3 py-1 rounded hover:bg-red-600 text-sm">
                    Active Account
                  </button>} */}
                 {users?.status === 0?"": <button onClick={() => handleInactiveAccount(users.id, "inactive")} style={{ color: "white", backgroundColor: "#f1582e" }} className="bg-red-500  px-3 py-1 rounded hover:bg-red-600 text-sm">
                    Inactive Account
                  </button>}
                  <button style={{ color: "white", backgroundColor: "#f1582e",cursor:"not-allowed" }} className="bg-blue-500  px-3 py-1 rounded hover:bg-blue-600 text-sm">
                    Edit
                  </button>
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </Button>
          <span className="text-sm">Page {currentPage} of {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
