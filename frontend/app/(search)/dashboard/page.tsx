import { FailedUrlTable } from '@/components/failed-url-table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { UrlTable } from '@/components/url-table';
import { getUserStatistics } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { Link, Search } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function page() {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }
    const [urls, failedUrls, indexCount, searchCount] = await getUserStatistics(
        user.id,
    );

    return (
        <ScrollArea className="group mx-auto overflow-auto peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px] my-10">
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Search & Index Statistics
                    </h2>
                </div>
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Index Count
                                    </CardTitle>
                                    <Link
                                        size={18}
                                        strokeWidth={2}
                                        color="gray"
                                    ></Link>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-primary">
                                        {indexCount}
                                    </div>
                                    <p className="pt-2 text-xs text-muted-foreground">
                                        bookmarks and urls
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Search Count
                                    </CardTitle>
                                    <Search
                                        size={18}
                                        strokeWidth={2}
                                        color="gray"
                                    ></Search>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-primary">
                                        {searchCount}
                                    </div>
                                    <p className="pt-2 text-xs text-muted-foreground">
                                        AI search
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="grid gap-4 grid-cols-1 ">
                            <Card className="col-span-4">
                                <CardHeader>
                                    <CardTitle>Recent Indexed Urls</CardTitle>
                                    <CardDescription>
                                        Recent bookmarks and web pages you have
                                        indexed
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pl-2">
                                    <UrlTable urls={urls} />
                                </CardContent>
                            </Card>
                        </div>
                        {failedUrls.length > 0 && (
                            <div className="grid gap-4 grid-cols-1 ">
                                <Card className="col-span-4">
                                    <CardHeader>
                                        <CardTitle>
                                            Failed Indexed Urls
                                        </CardTitle>
                                        <CardDescription className="text-md font-semibold py-2">
                                            Some web pages are inaccessible,
                                            Some web pages are not public.
                                            Please install the browser extension
                                            and index again.
                                        </CardDescription>
                                        <CardDescription className="text-md font-semibold py-2">
                                            Please refer to{' '}
                                            <a
                                                href="https://www.memfree.me/docs/index-bookmarks"
                                                target="_blank"
                                                className="text-primary"
                                            >
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
