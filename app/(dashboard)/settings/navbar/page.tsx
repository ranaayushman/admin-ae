"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  Save 
} from "lucide-react";
import { toast } from "sonner";
import {
  siteSettingsService,
  NavbarLink,
} from "@/lib/services/site-settings";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

// Recursive component to render navbar items
const NavbarItem = ({ 
  item, 
  index, 
  depth = 0, 
  onEdit, 
  onDelete, 
  onAddChild 
}: { 
  item: NavbarLink; 
  index: number; 
  depth?: number; 
  onEdit: (item: NavbarLink, path: number[]) => void;
  onDelete: (path: number[]) => void;
  onAddChild: (path: number[]) => void;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = item.children && item.children.length > 0;
  const path = [index]; // This is simplified; real path would need full recursion context. 
  // Actually, passing the full path from parent is better.
  
  return (
    <div className="border rounded-lg bg-card text-card-foreground mb-2">
      <div className="flex items-center gap-3 p-3">
        <div 
          className="p-1 cursor-pointer hover:bg-muted rounded"
          onClick={() => setIsOpen(!isOpen)}
          style={{ visibility: hasChildren ? "visible" : "hidden" }}
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.label}</span>
            {!item.isActive && (
              <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                Inactive
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">{item.url}</div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddChild([])} // Needs context fix
            title="Add Child"
          >
            <Plus size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item, [])} // Needs context fix
            title="Edit"
          >
            <Edit size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete([])} // Needs context fix
            title="Delete"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Render children */}
      {isOpen && hasChildren && (
        <div className="pl-8 pr-2 pb-2">
           {/* Recursive rendering logic needs to be hoisted to parent or handle paths properly */}
        </div>
      )}
    </div>
  );
};

export default function NavbarSettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [links, setLinks] = useState<NavbarLink[]>([]);
  
  // Edit State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavbarLink | null>(null);
  const [editingPath, setEditingPath] = useState<number[]>([]);
  
  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePath, setDeletePath] = useState<number[] | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await siteSettingsService.getAllSettings();
      if (settings?.navbarLinks) {
        setLinks(settings.navbarLinks);
      }
    } catch (error) {
      console.error("Failed to load settings", error);
      toast.error("Failed to load navbar settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (newLinks: NavbarLink[]) => {
    setIsSaving(true);
    try {
      await siteSettingsService.updateNavbarLinks({ navbarLinks: newLinks });
      setLinks(newLinks);
      toast.success("Navbar updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Save failed", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to update specific node at path
  // path is array of indices: [0, 2, 1] -> links[0].children[2].children[1]
  const updateNodeAtPath = (currentLinks: NavbarLink[], path: number[], newValue: NavbarLink | null): NavbarLink[] => {
    if (path.length === 0) return currentLinks; // Should not happen for update
    
    const [head, ...tail] = path;
    const newLinks = [...currentLinks];
    
    if (path.length === 1) {
      if (newValue === null) {
        // Delete
        newLinks.splice(head, 1);
      } else {
        // Update
        newLinks[head] = newValue;
      }
      return newLinks;
    }
    
    // Recurse
    if (newLinks[head]?.children) {
      newLinks[head] = {
        ...newLinks[head],
        children: updateNodeAtPath(newLinks[head].children!, tail, newValue)
      };
    }
    
    return newLinks;
  };

  const addNodeAtPath = (currentLinks: NavbarLink[], path: number[], newNode: NavbarLink): NavbarLink[] => {
    const newLinks = [...currentLinks];
    
    if (path.length === 0) {
      // Add to root
      newLinks.push(newNode);
      return newLinks;
    }
    
    // Add to child
    // Path points to the PARENT node where we want to append
    const navigate = (nodes: NavbarLink[], p: number[]): NavbarLink[] => {
      if (p.length === 0) {
        return [...nodes, newNode];
      }
      const [idx, ...rest] = p;
      if (!nodes[idx]) return nodes; // Error safety
      
      const updatedNode = { ...nodes[idx] };
      updatedNode.children = navigate(updatedNode.children || [], rest);
      nodes[idx] = updatedNode;
      return nodes;
    };

    return navigate(newLinks, path);
  };

  // --- Recursive List Renderer ---
  const renderList = (items: NavbarLink[], currentPath: number[]) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="space-y-2 mt-2">
        {items.map((item, idx) => {
          const itemPath = [...currentPath, idx];
          return (
            <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-gray-950">
              <div className="flex items-center justify-between p-3 gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                   <div className="flex flex-col">
                     <span className="font-medium truncate">{item.label}</span>
                     <span className="text-xs text-muted-foreground truncate">{item.url}</span>
                   </div>
                   {!item.isActive && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Hidden</span>}
                </div>
                
                <div className="flex items-center gap-1 shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => {
                       setEditingItem(item);
                       setEditingPath(itemPath);
                       setEditDialogOpen(true);
                    }}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-blue-600"
                    onClick={() => {
                       // Add child to this node
                       setEditingItem(null); // Clear item means 'New'
                       setEditingPath(itemPath); // Path is Parent
                       setEditDialogOpen(true);
                    }}
                  >
                    <Plus size={14} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-600"
                    onClick={() => {
                      setDeletePath(itemPath);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              
              {/* Children */}
              {item.children && item.children.length > 0 && (
                <div className="pl-6 pr-2 pb-2 border-t bg-gray-50/50">
                  {renderList(item.children, itemPath)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold">Navbar Settings</h1>
           <p className="text-gray-500">Manage site navigation structure</p>
         </div>
         <Button onClick={() => {
            setEditingItem(null);
            setEditingPath([]); // Root
            setEditDialogOpen(true);
         }}>
           <Plus className="mr-2 h-4 w-4" /> Add Root Link
         </Button>
       </div>

       <Card>
         <CardContent className="pt-6">
            {links.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No navbar links found. Add one to get started.
              </div>
            ) : (
              renderList(links, [])
            )}
         </CardContent>
       </Card>

       {/* Edit/Create Dialog (Simplified inline form for now or using a modal replacement) */}
       {editDialogOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-lg shadow-xl">
              <CardHeader>
                <CardTitle>{editingItem ? "Edit Link" : "Add Link"}</CardTitle>
                <CardDescription>
                  {editingItem ? "Modify existing navigation item" : "Create a new navigation item"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <EditLinkForm 
                   defaultValues={editingItem || { label: "", url: "", order: 0, isActive: true, children: [] }}
                   onCancel={() => setEditDialogOpen(false)}
                   onSave={(data) => {
                     let newLinks;
                     if (editingItem) {
                       // Update existng
                       newLinks = updateNodeAtPath(links, editingPath, { ...editingItem, ...data });
                     } else {
                       // Create new
                       // If adding child, path is parent path. If root, path is empty.
                       // My logic for addNodeAtPath assumes path points to PARENT. Correct.
                       newLinks = addNodeAtPath(links, editingPath, { ...data, children: [], order: data.order || 0 } as NavbarLink);
                     }
                     handleSave(newLinks);
                     setEditDialogOpen(false);
                   }}
                 />
              </CardContent>
            </Card>
         </div>
       )}

       <ConfirmDialog
         isOpen={deleteDialogOpen}
         onClose={() => setDeleteDialogOpen(false)}
         onConfirm={() => {
           if (deletePath) {
             const newLinks = updateNodeAtPath(links, deletePath, null);
             handleSave(newLinks);
             setDeleteDialogOpen(false);
           }
         }}
         title="Delete Link"
         description="Are you sure? This will delete the link and all its children."
         variant="danger"
         confirmText="Delete"
       />
    </div>
  );
}

// Sub-component for form
function EditLinkForm({ defaultValues, onSave, onCancel }: { 
  defaultValues: Partial<NavbarLink>; 
  onSave: (data: Partial<NavbarLink>) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(defaultValues);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Label</Label>
        <Input 
          value={formData.label || ""} 
          onChange={e => setFormData({ ...formData, label: e.target.value })}
          placeholder="e.g. Home"
        />
      </div>
      <div className="space-y-2">
         <Label>URL</Label>
         <Input 
           value={formData.url || ""} 
           onChange={e => setFormData({ ...formData, url: e.target.value })}
           placeholder="/path/to/page"
         />
      </div>
      <div className="space-y-2">
         <Label>Order (optional)</Label>
         <Input 
           type="number"
           value={formData.order || 0} 
           onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
         />
      </div>
      <div className="flex items-center space-x-2 pt-2">
         <Checkbox 
           id="isActive" 
           checked={formData.isActive ?? true}
           onCheckedChange={(c) => setFormData({ ...formData, isActive: !!c })}
         />
         <Label htmlFor="isActive">Active</Label>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData)}>Save</Button>
      </div>
    </div>
  );
}
