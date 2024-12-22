import Link from "next/link";

export type StepContent =
  | string
  | {
      type?: "text" | "image" | "video";
      content: string;
      alt?: string;
      caption?: string;
      link?: string;
    };

export const StepList = ({ steps }: { steps: StepContent[] }) => {
  const renderStepContent = (step: StepContent) => {
    const wrapWithLink = (content: React.ReactNode, link?: string) => {
      if (link) {
        return (
          <Link
            href={link}
            target="_blank"
            className="hover:opacity-80 transition-opacity"
          >
            {content}
          </Link>
        );
      }
      return content;
    };

    if (typeof step === "string") {
      return wrapWithLink(<p>{step}</p>);
    }

    const contentType = step.type || "text";

    switch (contentType) {
      case "text":
        return wrapWithLink(<p>{step.content}</p>, step.link);

      case "image":
        return wrapWithLink(
          <div className="flex flex-col">
            <img
              src={step.content}
              alt={step.alt || ""}
              className="max-w-full h-auto rounded-md"
            />
            {step.caption && <p className="py-8">{step.caption}</p>}
          </div>,
          step.link
        );

      case "video":
        return wrapWithLink(
          <div className="flex flex-col">
            <video
              src={step.content}
              controls
              className="max-w-full rounded-md"
            >
              Your browser does not support the video tag.
            </video>
            {step.caption && (
              <p className="text-sm text-gray-500 mt-2">{step.caption}</p>
            )}
          </div>,
          step.link
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative pl-8">
      {steps.map((step, index) => (
        <div key={index} className="relative pb-4 last:pb-0 flex items-center">
          {index < steps.length - 1 && (
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700 -translate-x-1/2" />
          )}

          <div
            className="absolute left-0 -translate-x-1/2 flex items-center justify-center
                  w-6 h-6 rounded-full 
                  bg-gray-200 dark:bg-gray-700
                  text-gray-800 dark:text-gray-200
                  text-xs font-semibold
                  shadow-md dark:shadow-lg"
          >
            {index + 1}
          </div>

          <div className="pl-8 flex-1 font-semibold">
            {renderStepContent(step)}
          </div>
        </div>
      ))}
    </div>
  );
};
