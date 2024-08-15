import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from './ui/card';
import { ClearHistory } from './sidebar/clear-history';
import { clearSearches } from '@/lib/store/search';

export function DeleteHistoryCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Delete History</CardTitle>
                <CardDescription>
                    Delete all your search history.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <ClearHistory isEnabled={true} clearSearches={clearSearches} />
            </CardFooter>
        </Card>
    );
}
