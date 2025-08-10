"use client";

import { useEffect, useState } from "react";
import api from "@/lib/app";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, ArrowUpDown, Plus } from "lucide-react";

type Status = "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";

interface Application {
  id: number;
  company: string;
  position: string;
  status: Status;
  resume: { id: number; name?: string } | number;
  createdAt: string;
  updatedAt: string;
}

interface GetApplicationsResponse {
  applications: Application[];
  totalPages: number;
  totalElements: number;
}

const statusOptions: Status[] = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

export default function ApplicationsPage() {
  const [resumes, setResumes] = useState<{ id: number; name: string }[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<
    "createdAt" | "company" | "status" | "updatedAt"
  >("createdAt");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editApp, setEditApp] = useState<Application | null>(null);
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    resumeId: 0,
  });
  const [formErrors, setFormErrors] = useState({
    company: "",
    position: "",
    resumeId: "",
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<Application | null>(null);

  useEffect(() => {
    const fetchResumes = async () => {
      setLoadingResumes(true);
      try {
        const res = await api.get<{ success: boolean; data: any[] }>("/resume");
        if (res.data.success) {
          setResumes(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch resumes", err);
      }
      setLoadingResumes(false);
    };
    fetchResumes();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get<{
        success: boolean;
        data: GetApplicationsResponse;
      }>(`/application?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}`);
      if (res.data.success) {
        setApplications(res.data.data.applications);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const updateStatus = async (id: number, newStatus: Status) => {
    try {
      await api.put(`/application/status/${id}`, { status: newStatus });
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.company.trim()) {
        setFormErrors((f) => ({ ...f, company: "Company is required" }));
        return;
      }
      if (!formData.position.trim()) {
        setFormErrors((f) => ({ ...f, position: "Position is required" }));
        return;
      }
      if (!formData.resumeId) {
        setFormErrors((f) => ({ ...f, resumeId: "Resume is required" }));
        return;
      }

      const validResumeIds = resumes.map((r) => r.id);
      if (!validResumeIds.includes(formData.resumeId)) {
        setFormErrors((f) => ({
          ...f,
          resumeId: "Selected resume is not valid",
        }));
        return;
      }

      if (editApp) {
        await api.put(`/application/${editApp.id}`, formData);
      } else {
        await api.post(`/application`, formData);
      }
      setDialogOpen(false);
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };
  const confirmDelete = async () => {
    if (!appToDelete) return;
    try {
      await api.delete(`/application/${appToDelete.id}`);
      setDeleteDialogOpen(false);
      setAppToDelete(null);
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSort = (
    field: "createdAt" | "company" | "status" | "updatedAt"
  ) => {
    setSortBy(field);
  };

  useEffect(() => {
    fetchApplications();
  }, [page, sortBy]);

  useEffect(() => {
    if (editApp) {
      setFormData({
        company: editApp.company,
        position: editApp.position,
        resumeId:
          typeof editApp.resume === "number"
            ? editApp.resume
            : editApp.resume?.id || 0,
      });
    } else {
      setFormData({
        company: "",
        position: "",
        resumeId: 0,
      });
    }
    setFormErrors({ company: "", position: "", resumeId: "" });
  }, [editApp]);

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/menu">Menu</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/applications" className="font-semibold">
              Applications
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Add/Edit Dialog */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Applications</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditApp(null);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Application
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editApp ? "Edit Application" : "New Application"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Company"
                  value={formData.company}
                  onChange={(e) => {
                    setFormData((f) => ({ ...f, company: e.target.value }));
                    if (formErrors.company) {
                      setFormErrors((prev) => ({ ...prev, company: "" }));
                    }
                  }}
                  className={formErrors.company ? "border-red-500" : ""}
                />
                {formErrors.company && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.company}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Position"
                  value={formData.position}
                  onChange={(e) => {
                    setFormData((f) => ({ ...f, position: e.target.value }));
                    if (formErrors.position) {
                      setFormErrors((prev) => ({ ...prev, position: "" }));
                    }
                  }}
                  className={formErrors.position ? "border-red-500" : ""}
                />
                {formErrors.position && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.position}
                  </p>
                )}
              </div>

              <div>
                <Select
                  value={formData.resumeId.toString()}
                  onValueChange={(val) => {
                    setFormData((f) => ({ ...f, resumeId: Number(val) }));
                    if (formErrors.resumeId) {
                      setFormErrors((prev) => ({ ...prev, resumeId: "" }));
                    }
                  }}
                  disabled={loadingResumes}
                >
                  <SelectTrigger
                    className={formErrors.resumeId ? "border-red-500" : ""}
                  >
                    <SelectValue
                      placeholder={
                        loadingResumes ? "Loading resumes..." : "Select Resume"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes.map((r) => (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.resumeId && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.resumeId}
                  </p>
                )}
              </div>
              <Button onClick={handleSave}>
                {editApp ? "Update" : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the application at{" "}
            <strong>{appToDelete?.company}</strong> for position{" "}
            <strong>{appToDelete?.position}</strong>?
          </p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setAppToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-white shadow-md rounded-lg p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("company")}
              >
                Company <ArrowUpDown className="inline h-4 w-4" />
              </TableHead>
              <TableHead>Position</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("status")}
              >
                Status <ArrowUpDown className="inline h-4 w-4" />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("createdAt")}
              >
                Created <ArrowUpDown className="inline h-4 w-4" />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("updatedAt")}
              >
                Updated <ArrowUpDown className="inline h-4 w-4" />
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : applications.length > 0 ? (
              applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>{app.company}</TableCell>
                  <TableCell>{app.position}</TableCell>
                  <TableCell>
                    <Select
                      value={app.status}
                      onValueChange={(value: Status) =>
                        updateStatus(app.id, value)
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(app.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(app.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditApp(app);
                        setDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="ml-2"
                      onClick={() => {
                        setAppToDelete(app);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-4">
                  No applications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
