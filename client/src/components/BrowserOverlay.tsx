import clsx from "clsx";
import { useBrowserState } from "../state/browsers";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import { FormEvent, useEffect, useState } from "react";
import { emitEvent } from "../common/socket";

export default function BrowserOverlay() {
  const url = useBrowserState((state) => state.url);
  const favicon = useBrowserState((state) => state.favicon);

  const [localUrl, setLocalUrl] = useState(url || "");

  useEffect(() => {
    setLocalUrl(url || "");
  }, [url]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    emitEvent({
      type: "navigate",
      url: localUrl,
    });
  }

  function handleBack() {
    emitEvent({
      type: "navigate_back",
    });
  }

  function handleForward() {
    emitEvent({
      type: "navigate_forward",
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed top-5 left-0 bg-discord-dark-1 py-1 pl-2 pr-1 rounded-r-full flex items-center space-x-1 hover:space-x-2 shadow group z-20"
    >
      <div className="flex items-center space-x-2">
        <ChevronLeftIcon
          className="h-6 w-6 cursor-pointer text-gray-300 hover:text-gray-100"
          role="button"
          onClick={handleBack}
        />
        <ChevronRightIcon
          className="h-6 w-6 cursor-pointer text-gray-300 hover:text-gray-100"
          role="button"
          onClick={handleForward}
        />
      </div>

      <input
        className="w-0 group-hover:w-48 overflow-hidden transition-all bg-discord-dark-0 rounded outline-none focus:outline-none text-gray-300 group-hover:py-1 group-hover:px-2 text-sm"
        value={localUrl}
        onChange={(e) => setLocalUrl(e.target.value)}
      />
      <div className="h-8 w-8 flex items-center justify-center">
        {favicon && (
          <img
            src={favicon}
            alt=""
            className="h-full w-full group-hover:hidden rounded-full bg-discord-dark-0"
          />
        )}
        <button type="submit">
          {url === localUrl ? (
            <ArrowPathIcon
              className="w-0 h-6 group-hover:w-6 cursor-pointer text-gray-300 hover:text-gray-100"
              role="button"
            />
          ) : (
            <MagnifyingGlassIcon
              className={clsx(
                "h-7 w-7 text-gray-300 hover:text-gray-100",
                favicon && "hidden group-hover:block"
              )}
            />
          )}
        </button>
      </div>
    </form>
  );
}
