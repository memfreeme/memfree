import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function ThemeCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Switch light and dark theme</CardDescription>
            </CardHeader>
            <CardFooter>
                <ThemeToggle showCurrentTheme={true} />
            </CardFooter>
        </Card>
    );
}
