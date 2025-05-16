"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";
import { API_BASE_URL, apiClient } from "@/services/apiService";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  role_id: number;
  profile: string | null;
  status: number;
}

const ITEMS_PER_PAGE = 15;

export default function AdminUsersPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch admin users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiClient.get("/admin/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    //   console.log(response)
      setUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      toast({
        title: t("Error") || "Error",
        description: t("FailedToFetchUsers") || "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter and paginate users
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.mobile.includes(searchQuery)
  );
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handle status toggle (active/inactive)
  const handleToggleStatus = async (id: number, currentStatus: number) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = currentStatus === 1 ? 0 : 1;
      const response = await apiClient.put(
        `/admin/updateAdminUserStatus/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    //   console.log("Response:", response);
      if (response.data.success) {
        toast({
          title: t("Success") || "Success",
          description: t("UserStatusUpdated") || "User status updated successfully",
        });
        fetchUsers();
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      toast({
        title: t("Error") || "Error",
        description: t("FailedToUpdateStatus") || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  // Store user data for editing
  const handleEditUserProfile = (user: AdminUser) => {
    sessionStorage.setItem("editUserDetails", JSON.stringify(user));
  };

//   console.log("Users:", users);
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("AdminUsersHeading") || "Admin Users"}</h1>
          <p className="text-muted-foreground">{t("ManageAdminUsers") || "Manage admin users and their roles"}</p>
        </div>
        <Link href="/admin/adminUser/add">
          <Button style={{ backgroundColor: "#f1582e", color: "white" }}>
            <Plus className="mr-2 h-4 w-4" /> {t("AddAdminUser") || "Add Admin User"}
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 w-full">
        <Input
          type="search"
          placeholder={t("SearchAdminUsersPlaceholder") || "Search by name, email, or mobile..."}
          className="pl-8 w-full"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* User List */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedUsers.map((user) => (
          <Card key={user.id} className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden flex items-center justify-center px-4">
              <div className="flex items-center gap-2" style={{ width: "200px", height: "200px",justifyContent: "center", alignItems: "center" }}>
                {user.profile ? (
                  <img
                    src={`${API_BASE_URL}/${user.profile}`}
                    onError={
                        (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            e.currentTarget.src = "https://foodeus.truet.net/profile/1747392855079-userIcon.png";
                        }
                    }
                    alt={user.name}
                    className="h-12 w-12 rounded-full object-fill"
                    style={{ width: "100px", height: "100px", borderRadius: "50%" }}
                  />
                ) : (
                  <User className="text-gray-400" />
                )}
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{t("Email") || "Email"}: {user?.email}</p>
                  <p className="text-sm text-muted-foreground">{t("Mobile") || "Mobile"}: {user?.mobile}</p>
                  <p className="text-sm text-muted-foreground">{t("Role") || "Role"}: {user?.role}</p>
                  <p>
                    {t("Status") || "Status"}:{" "}
                    <b className={`text-sm ${user.status === 1 ? "text-green-500" : "text-red-500"}`}>
                      {user.status === 1 ? t("Active") || "Active" : t("Inactive") || "Inactive"}
                    </b>
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-2 pt-0 flex justify-between">
              <div className="flex items-center gap-1">
                <Button
                  style={{ backgroundColor: "#f1582e", color: "white" }}
                  onClick={() => handleToggleStatus(user.id, user.status)}
                >
                  {user.status === 1 ? t("Deactivate") || "Deactivate" : t("Activate") || "Activate"}
                </Button>
                <Link href={`/admin/adminUser/${user.id}/edit`}>
                  <Button
                    style={{ backgroundColor: "#f1582e", color: "white" }}
                    onClick={() => handleEditUserProfile(user)}
                  >
                    {t("Edit") || "Edit"}
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            {t("Previous") || "Previous"}
          </Button>
          <span className="text-sm">
            {t("Page") || "Page"} {currentPage} {t("of") || "of"} {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            {t("Next") || "Next"}
          </Button>
        </div>
      )}
    </div>
  );
}