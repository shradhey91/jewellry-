

'use client';

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageEditorDialog } from "./page-editor-dialog";
import { DeletePageButton } from "./delete-page-button";

export interface Page {
  id: string;
  title: string;
  slug: string;
  status: "Published" | "Draft";
  last_modified: string;
  filePath: string;
  editPath: string;
  content?: string;
}

// Mock data for pages. In a real app, this would come from a database.
const pages: Page[] = [
  {
    id: "page-1",
    title: "Contact Us",
    slug: "/contact-us",
    status: "Published",
    last_modified: new Date().toLocaleDateString("en-GB"),
    filePath: "src/app/(main)/contact-us/page.tsx",
    editPath: "/admin/pages/contact-us",
  },
  {
    id: "page-2",
    title: "Diamond Guide",
    slug: "/guides/diamond-guide",
    status: "Published",
    last_modified: new Date().toLocaleDateString("en-GB"),
    filePath: "src/app/(main)/guides/diamond-guide/page.tsx",
    editPath: "/admin/pages/diamond-guide",
  },
  {
    id: "page-3",
    title: "Shop by Categories",
    slug: "/shop",
    status: "Published",
    last_modified: new Date().toLocaleDateString("en-GB"),
    filePath: "src/app/(main)/shop/page.tsx",
    editPath: "/admin/pages/shop",
  }
];

export default function PagesPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Pages"
        description="Manage your custom pages and landing pages."
      >
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Page
        </Button>
      </PageHeader>
       <Card>
        <CardHeader>
          <CardTitle>All Pages</CardTitle>
          <CardDescription>
            View and manage all custom pages on your site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>
                    <Link href={page.slug} target="_blank" className="text-blue-600 hover:underline">
                      {page.slug}
                    </Link>
                  </TableCell>
                  <TableCell>{page.status}</TableCell>
                  <TableCell>{page.last_modified}</TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {page.editPath.startsWith('/admin/pages/') ? (
                            <DropdownMenuItem asChild>
                              <Link href={page.editPath} className="flex items-center">
                                 <Edit className="mr-2 h-4 w-4" />
                                 <span>Edit (Visual Editor)</span>
                              </Link>
                            </DropdownMenuItem>
                          ) : (
                            <PageEditorDialog 
                              page={page}
                              trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center">
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit Details</span>
                                </DropdownMenuItem>
                              }
                            />
                          )}
                          <DeletePageButton page={page} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
