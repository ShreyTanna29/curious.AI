"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

const githubSchema = z.object({
  token: z.string().min(1, "GitHub token is required"),
});

const trelloSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  token: z.string().min(1, "Token is required"),
});

const linkedinSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client secret is required"),
  accessToken: z.string().min(1, "Access token is required"),
});

const clickupSchema = z.object({
  token: z.string().min(1, "ClickUp token is required"),
});

export default function SettingsPage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const githubForm = useForm<z.infer<typeof githubSchema>>({
    resolver: zodResolver(githubSchema),
    defaultValues: {
      token: "",
    },
  });

  const trelloForm = useForm<z.infer<typeof trelloSchema>>({
    resolver: zodResolver(trelloSchema),
    defaultValues: {
      apiKey: "",
      token: "",
    },
  });

  const linkedinForm = useForm<z.infer<typeof linkedinSchema>>({
    resolver: zodResolver(linkedinSchema),
    defaultValues: {
      clientId: "",
      clientSecret: "",
      accessToken: "",
    },
  });

  const clickupForm = useForm<z.infer<typeof clickupSchema>>({
    resolver: zodResolver(clickupSchema),
    defaultValues: {
      token: "",
    },
  });

  const onSubmit = async (service: string, values: any) => {
    try {
      setIsLoading(true);
      await axios.post("/api/user/credentials", {
        service,
        credentials: values,
      });
      toast({
        title: "Success",
        description: `${service} credentials updated successfully`,
      });
    } catch (err) {
      console.error("[CREDENTIALS_UPDATE]", err);
      toast({
        title: "Error",
        description: "Failed to update credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async (service: string) => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/user/credentials?service=${service}`);
      toast({
        title: "Success",
        description: `${service} credentials removed successfully`,
      });
    } catch (err) {
      console.error("[CREDENTIALS_DELETE]", err);
      toast({
        title: "Error",
        description: "Failed to remove credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Service Settings</h1>
      <Tabs defaultValue="github" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="github">GitHub</TabsTrigger>
          <TabsTrigger value="trello">Trello</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="clickup">ClickUp</TabsTrigger>
        </TabsList>

        <TabsContent value="github">
          <Card>
            <CardHeader>
              <CardTitle>GitHub Integration</CardTitle>
              <CardDescription>
                Add your GitHub personal access token to enable GitHub
                integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...githubForm}>
                <form
                  onSubmit={githubForm.handleSubmit((values) =>
                    onSubmit("github", values)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={githubForm.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal Access Token</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => onDelete("github")}
                      disabled={isLoading}
                    >
                      Remove
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trello">
          <Card>
            <CardHeader>
              <CardTitle>Trello Integration</CardTitle>
              <CardDescription>
                Add your Trello API key and token to enable Trello integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...trelloForm}>
                <form
                  onSubmit={trelloForm.handleSubmit((values) =>
                    onSubmit("trello", values)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={trelloForm.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={trelloForm.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => onDelete("trello")}
                      disabled={isLoading}
                    >
                      Remove
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="linkedin">
          <Card>
            <CardHeader>
              <CardTitle>LinkedIn Integration</CardTitle>
              <CardDescription>
                Add your LinkedIn API credentials to enable LinkedIn integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...linkedinForm}>
                <form
                  onSubmit={linkedinForm.handleSubmit((values) =>
                    onSubmit("linkedin", values)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={linkedinForm.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client ID</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="xxxxxxxxxxxxxxxx"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={linkedinForm.control}
                    name="clientSecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Secret</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="xxxxxxxxxxxxxxxx"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={linkedinForm.control}
                    name="accessToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Token</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="xxxxxxxxxxxxxxxx"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => onDelete("linkedin")}
                      disabled={isLoading}
                    >
                      Remove
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clickup">
          <Card>
            <CardHeader>
              <CardTitle>ClickUp Integration</CardTitle>
              <CardDescription>
                Add your ClickUp API token to enable ClickUp integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...clickupForm}>
                <form
                  onSubmit={clickupForm.handleSubmit((values) =>
                    onSubmit("clickup", values)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={clickupForm.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Token</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="pk_xxxxxxxxxxxxxxxxxxxx"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => onDelete("clickup")}
                      disabled={isLoading}
                    >
                      Remove
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
