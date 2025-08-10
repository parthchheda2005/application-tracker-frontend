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
import { Plus, Pencil } from "lucide-react";
import axios from "axios";

interface Resume {
  id: number;
  name: string;
  azureBlobPath: string;
  createdAt: string;
  updatedAt: string;
}

const sampleResumes = [
  {
    id: 1,
    name: "Software Engineer Resume",
    azureBlobPath:
      "https://yourblobstorage.blob.core.windows.net/resumes/software-engineer.pdf",
    createdAt: "2024-07-20T10:15:30Z",
    updatedAt: "2024-08-05T12:00:00Z",
  },
  {
    id: 2,
    name: "Data Scientist Resume",
    azureBlobPath:
      "https://yourblobstorage.blob.core.windows.net/resumes/data-scientist.pdf",
    createdAt: "2024-06-15T09:00:00Z",
    updatedAt: "2024-06-20T16:30:00Z",
  },
  {
    id: 3,
    name: "Product Manager Resume",
    azureBlobPath:
      "https://yourblobstorage.blob.core.windows.net/resumes/product-manager.pdf",
    createdAt: "2024-01-10T08:45:00Z",
    updatedAt: "2024-03-12T14:20:00Z",
  },
  {
    id: 4,
    name: "Internship Resume",
    azureBlobPath:
      "https://yourblobstorage.blob.core.windows.net/resumes/internship.pdf",
    createdAt: "2023-12-01T11:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
];

const Resumes = () => {
  const [resumes, setResumes] = useState<Resume[]>(sampleResumes);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [editResumeId, setEditResumeId] = useState<number | null>(null);

  const fetchResumes = async () => {
    try {
      const res = await axios.get("/resume");
      if (res.data.success) {
        setResumes(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching resumes:", err);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleOpenResume = (path: string) => {
    window.open(path, "_blank");
  };

  const uploadFileAndGetUrl = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    // Replace with your actual upload endpoint
    const uploadRes = await axios.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return uploadRes.data.url;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    try {
      const azureBlobPath = await uploadFileAndGetUrl(file);

      await axios.post("/resume", { name, azureBlobPath });

      setOpenCreate(false);
      setName("");
      setFile(null);
      fetchResumes();
    } catch (err) {
      console.error("Error creating resume:", err);
    }
  };

  const handleEditClick = (resume: Resume) => {
    setEditResumeId(resume.id);
    setName(resume.name);
    setFile(null); // Optional: user can leave file unchanged
    setOpenEdit(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let azureBlobPath: string | undefined;

      if (file) {
        azureBlobPath = await uploadFileAndGetUrl(file);
      }

      await axios.put(`/resume/${editResumeId}`, {
        name,
        azureBlobPath, // If file not updated, backend can keep old path
      });

      setOpenEdit(false);
      setEditResumeId(null);
      setName("");
      setFile(null);
      fetchResumes();
    } catch (err) {
      console.error("Error updating resume:", err);
    }
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

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Resumes</h1>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Resume
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Resume</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="file">Upload Resume</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Save
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resume List */}
      {resumes.length === 0 ? (
        <p className="text-gray-500">
          No resumes found. Create your first one!
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
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
              <CardContent>
                <p className="text-sm text-gray-600">
                  Last updated:{" "}
                  {new Date(resume.updatedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Resume</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="editName">Name</Label>
              <Input
                id="editName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="editFile">Replace Resume (optional)</Label>
              <Input
                id="editFile"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button type="submit" className="w-full">
              Update
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Resumes;
