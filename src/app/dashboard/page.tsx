import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

export default async function DashboardPage() {
    const supabase = await supabaseServer();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch items reported by the user
    // We also want to know if there are any claims on these items
    const { data: myReports } = await supabase
        .from("items")
        .select(`
            *,
            claims (
                id,
                status,
                claimant_id,
                created_at,
                profiles:claimant_id (full_name)
            )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    // Fetch items claimed by the user
    const { data: myClaims } = await supabase
        .from("claims")
        .select(`
            *,
            items (
                title,
                image_url,
                category
            )
        `)
        .eq("claimant_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-3xl font-bold mb-2">My Activity</h1>
            <p className="text-muted-foreground mb-8">Manage your reports and track your claims.</p>

            <Tabs defaultValue="reports" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="reports">My Reports ({myReports?.length || 0})</TabsTrigger>
                    <TabsTrigger value="claims">My Claims ({myClaims?.length || 0})</TabsTrigger>
                </TabsList>

                {/* MY REPORTS TAB */}
                <TabsContent value="reports" className="space-y-6">
                    {myReports && myReports.length > 0 ? (
                        <div className="grid gap-6">
                            {myReports.map((item) => {
                                const pendingClaims = item.claims.filter((c: any) => c.status === 'PENDING');
                                const hasPending = pendingClaims.length > 0;

                                return (
                                    <div key={item.id} className="relative">
                                        {hasPending && (
                                            <span className="absolute -top-2 -right-2 flex h-4 w-4">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                                            </span>
                                        )}
                                        <Card className={hasPending ? "border-red-500/50" : ""}>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-base font-medium">
                                                        {item.title}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Posted {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                                    </CardDescription>
                                                </div>
                                                <Badge variant={
                                                    item.status === 'OPEN' ? 'default' :
                                                        item.status === 'RESOLVED' ? 'secondary' : 'outline'
                                                }>
                                                    {item.status}
                                                </Badge>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid gap-4 mt-2">
                                                    <div className="flex items-center text-sm text-muted-foreground gap-4">
                                                        <span>{item.category}</span>
                                                        <span>•</span>
                                                        <span>{item.location}</span>
                                                    </div>

                                                    {/* CLAIMS SECTION */}
                                                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                                                        <h4 className="text-sm font-semibold flex items-center gap-2">
                                                            <AlertCircle className="h-4 w-4" />
                                                            Claims ({item.claims.length})
                                                        </h4>

                                                        {item.claims.length === 0 ? (
                                                            <p className="text-sm text-muted-foreground">No claims yet.</p>
                                                        ) : (
                                                            <div className="space-y-3">
                                                                {item.claims.map((claim: any) => (
                                                                    <div key={claim.id} className="flex items-center justify-between bg-background p-3 rounded-md border text-sm">
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium">{claim.profiles?.full_name || 'Unknown User'}</span>
                                                                            <span className="text-xs text-muted-foreground">
                                                                                {formatDistanceToNow(new Date(claim.created_at), { addSuffix: true })}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            {claim.status === 'PENDING' && (
                                                                                <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending Review</Badge>
                                                                            )}
                                                                            {claim.status === 'APPROVED' && (
                                                                                <Badge variant="outline" className="border-green-500 text-green-500">Approved</Badge>
                                                                            )}
                                                                            {claim.status === 'REJECTED' && (
                                                                                <Badge variant="outline" className="border-red-500 text-red-500">Rejected</Badge>
                                                                            )}

                                                                            {/* Action Buttons for Pending Claims */}
                                                                            {/* TODO: Add Approve/Reject actions here later if requested */}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">You haven't reported any items yet.</p>
                            <Button asChild className="mt-4">
                                <Link href="/report">Report an Item</Link>
                            </Button>
                        </div>
                    )}
                </TabsContent>

                {/* MY CLAIMS TAB */}
                <TabsContent value="claims" className="space-y-6">
                    {myClaims && myClaims.length > 0 ? (
                        <div className="grid gap-4">
                            {myClaims.map((claim) => (
                                <Card key={claim.id}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base font-medium">
                                                Claim for: {claim.items.title}
                                            </CardTitle>
                                            <CardDescription>
                                                Submitted {formatDistanceToNow(new Date(claim.created_at), { addSuffix: true })}
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {claim.status === 'PENDING' && <Clock className="h-5 w-5 text-yellow-500" />}
                                            {claim.status === 'APPROVED' && <CheckCircle className="h-5 w-5 text-green-500" />}
                                            {claim.status === 'REJECTED' && <XCircle className="h-5 w-5 text-red-500" />}
                                            <span className={`text-sm font-medium ${claim.status === 'PENDING' ? 'text-yellow-500' :
                                                    claim.status === 'APPROVED' ? 'text-green-500' : 'text-red-500'
                                                }`}>
                                                {claim.status}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4 mt-2">
                                            {claim.items.image_url && (
                                                <div className="h-16 w-16 rounded-md overflow-hidden bg-muted">
                                                    <img src={claim.items.image_url} alt="Item" className="h-full w-full object-cover" />
                                                </div>
                                            )}
                                            <div className="text-sm">
                                                <p><span className="text-muted-foreground">Category:</span> {claim.items.category}</p>
                                                {claim.proof_description && (
                                                    <p className="mt-1"><span className="text-muted-foreground">Your Proof:</span> {claim.proof_description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">You haven't claimed any items yet.</p>
                            <Button asChild className="mt-4">
                                <Link href="/items">Browse Items</Link>
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
