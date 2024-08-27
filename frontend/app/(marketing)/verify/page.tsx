import { Icons } from '@/components/shared/icons';
import { siteConfig } from '@/config';

export default function VerifyPage() {
    return (
        <div className="my-10 mx-2 md:max-w-md md:mx-auto">
            <div className="flex flex-col items-center justify-center space-y-10 bg-background py-6 text-center border rounded-2xl mx-2">
                <a href={siteConfig.url}>
                    <Icons.brain className="size-10 text-primary" />
                </a>
                <p className="text-md font-bold">
                    A Sign In Link has been sent to your email
                </p>
                <p className="text-md font-bold">Please Check Your Email</p>
                <p className="text-lg font-bold text-primary">
                    Click the Link to Sign In
                </p>
            </div>
        </div>
    );
}
