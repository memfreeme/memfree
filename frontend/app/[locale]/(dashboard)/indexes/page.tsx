import { FailedUrlTable } from '@/components/failed-url-table';
import { IndexesTable } from '@/components/indexes-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { getUserStatistics } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function page() {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }
    const [urls, failedUrls, count] = await getUserStatistics(user.id);

    return (
        <ScrollArea className="group mx-auto overflow-auto">
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Your Indexed Local Files & Web Pages & Bookmarks </h2>
                </div>
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 grid-cols-1 ">
                            <Card className="col-span-4">
                                <CardContent className="pl-2">
                                    <IndexesTable userId={user.id} initialUrls={urls} totalCount={count} />
                                </CardContent>
                            </Card>
                        </div>
                        {failedUrls.length > 0 && (
                            <div className="grid gap-4 grid-cols-1 ">
                                <Card className="col-span-4">
                                    <CardHeader>
                                        <CardTitle>Failed Indexed Urls</CardTitle>
                                        <CardDescription className="text-md font-semibold py-2">
                                            Some web pages are inaccessible, Some web pages are not public. Please install the browser extension and index
                                            again.
                                        </CardDescription>
                                        <CardDescription className="text-md font-semibold py-2">
                                            Please refer to{' '}
                                            <a href="https://www.memfree.me/docs/index-bookmarks" target="_blank" className="text-primary">
                                                How to Index Web Pages
                                            </a>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pl-2">
                                        <FailedUrlTable urls={failedUrls} />
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </ScrollArea>
    );
}
