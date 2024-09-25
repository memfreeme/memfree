import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import LocaleSelect from '@/components/locale-selection';

export function LanguageCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Language</CardTitle>
                <CardDescription>Switch Page Language</CardDescription>
            </CardHeader>
            <CardFooter>
                <LocaleSelect className="hover:bg-accent hover:text-accent-foreground" showCurrentLocale={true} />
            </CardFooter>
        </Card>
    );
}
