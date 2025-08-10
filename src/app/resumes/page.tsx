"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "@/lib/app";

interface Resume {
  id: number;
  name: string;
  azureBlobPath: string;
  createdAt: string;
  updatedAt: string;
}

const Resumes = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [editResumeId, setEditResumeId] = useState<number | null>(null);
  const [resumeToDelete, setResumeToDelete] = useState<Resume | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenResume = async (fileName: string) => {
    try {
      const res = await api.get(`/blob/${fileName}`);
      window.open(res.data.data, "_blank");
    } catch (error) {
      console.error("Failed to open resume: ", error);
    }
  };

  const fetchResumes = async () => {
    try {
      const res = await api.get("/resume");
      console.log(res);
      if (res.data.success) {
        setResumes(res.data.data);
        console.log(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching resumes:", err);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const uploadFileAndGetUrl = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await api.post("/blob", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return uploadRes.data.data;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    setLoading(true);
    try {
      const azureBlobPath = await uploadFileAndGetUrl(file);

      await api.post("/resume", { name, azureBlobPath });

      setOpenCreate(false);
      setName("");
      setFile(null);
      fetchResumes();
    } catch (err) {
      console.error("Error creating resume:", err);
    }
    setLoading(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let azureBlobPath: string | undefined;

      if (!editResumeId) {
        console.error("No resume selected for edit");
        return;
      }

      if (file) {
        azureBlobPath = await uploadFileAndGetUrl(file);
      }

      await api.put(`/resume/${editResumeId}`, {
        name,
        azureBlobPath,
      });

      setOpenEdit(false);
      setEditResumeId(null);
      setName("");
      setFile(null);
      fetchResumes();
    } catch (err) {
      console.error("Error updating resume:", err);
    }
    setLoading(false);
  };

  const handleEditClick = (resume: Resume) => {
    setEditResumeId(resume.id);
    setName(resume.name);
    setFile(null);
    setOpenEdit(true);
  };

  const handleDeleteClick = (resume: Resume) => {
    setResumeToDelete(resume);
    setOpenDelete(true);
  };

  const deleteResume = async (resume: Resume | null) => {
    if (!resume) return;
    setLoading(true);
    try {
      await api.delete(`/resume/${resume.id}`);
      setOpenDelete(false);
      setResumeToDelete(null);
      fetchResumes();
    } catch (error) {
      console.error("Error deleting resume: ", error);
    }
    setLoading(false);
  };

  const cancelDelete = () => {
    setOpenDelete(false);
    setResumeToDelete(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/** Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/menu">Menu</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/resumes" className="font-semibold">
              Resumes
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/** Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Resumes</h1>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Resume
            </Button>
          </DialogTrigger>
          {/** Create Resume dialogue */}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Resume</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="my-2">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="file" className="my-2">
                  Upload Resume
                </Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full">
                Save
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/** Resume List */}
      {resumes?.length === 0 ? (
        <p className="text-gray-500">
          No resumes found. Create your first one!
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes?.map((resume) => (
            <Card
              key={resume.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleOpenResume(resume.azureBlobPath)}
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {resume.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={loading}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(resume);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  Created: {new Date(resume.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Last updated:{" "}
                  {new Date(resume.updatedAt).toLocaleDateString()}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={loading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(resume);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/** Delete Confirmation Dialog */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="mb-4">
            Are you sure you want to delete{" "}
            <strong>{resumeToDelete?.name}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={cancelDelete} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteResume(resumeToDelete)}
              disabled={loading}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/** Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Resume</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="editName" className="my-2">
                Name
              </Label>
              <Input
                id="editName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="editFile" className="my-2">
                Replace Resume (optional)
              </Label>
              <Input
                id="editFile"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              Update
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Resumes;
