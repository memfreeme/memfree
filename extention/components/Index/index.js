import React, { useEffect, useState } from "react";
import CheckboxTree from "react-checkbox-tree";
import "react-checkbox-tree/lib/react-checkbox-tree.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faCheckSquare,
  faSquare,
  faMinus,
  faChevronRight,
  faChevronDown,
  faPlusSquare,
  faMinusSquare,
  faFolder,
  faFolderOpen,
  faFile,
} from "@fortawesome/free-solid-svg-icons";

const fontAwesomeIcons = {
  check: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-check bg-white"
      icon={faCheckSquare}
    />
  ),
  uncheck: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-uncheck bg-white"
      icon={faSquare}
    />
  ),
  halfCheck: (
    <FontAwesomeIcon className="rct-icon rct-icon-half-check" icon={faMinus} />
  ),
  expandClose: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-expand-close"
      icon={faChevronRight}
    />
  ),
  expandOpen: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-expand-open"
      icon={faChevronDown}
    />
  ),
  expandAll: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-expand-all"
      icon={faPlusSquare}
    />
  ),
  collapseAll: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-collapse-all"
      icon={faMinusSquare}
    />
  ),
  parentClose: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-parent-close"
      icon={faFolder}
    />
  ),
  parentOpen: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-parent-open"
      icon={faFolderOpen}
    />
  ),
  leaf: (
    <FontAwesomeIcon className="rct-icon rct-icon-leaf-close" icon={faFile} />
  ),
};

export default function Index() {
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [totalUrlsIndexed, setTotalUrlsIndexed] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [hasError, setHasError] = useState(false);

  const [nodes, setNodes] = useState([]);
  const [checked, setChecked] = useState([]);
  const [expanded, setExpanded] = useState([]);

  const onCheck = (value) => {
    setChecked(value);
  };

  const onExpand = (value) => {
    setExpanded(value);
  };

  useEffect(() => {
    chrome.storage.local.get(["user"], (result) => {
      if (result.user) {
        console.log("User found in local storage:", result.user);
        setUserInfo(result.user);
      } else {
        fetch("https://www.memfree.me/api/auth/session")
          .then((response) => response.json())
          .then((data) => {
            if (!data || !data.user) {
              // show login button logic here
            } else {
              chrome.storage.local.set({ user: data.user }, () => {
                setUserInfo(data.user);
              });
            }
          })
          .catch((error) =>
            console.error("Error fetching user session:", error)
          );
      }
    });
    updateProgress();
  }, []);

  const updateProgress = () => {
    chrome.storage.local.get(
      ["progress", "totalUrlsIndexed", "hasError"],
      (storage) => {
        setProgressPercentage(storage.progress || 0);
        setTotalUrlsIndexed(storage.totalUrlsIndexed || 0);
        setHasError(storage.hasError || false);
      }
    );
  };

  const handleChooseookmarks = () => {
    setIsProcessing(true);
    getAndDisplayBookmarkTree();
  };

  const handleSyncSelectedBookmarks = () => {
    syncBookmarks({
      folders: checked.filter((id) =>
        nodes.some((n) => n.value === id && n.children)
      ),
      bookmarks: checked.filter(
        (id) => !nodes.some((n) => n.value === id && n.children)
      ),
    });
  };

  const getAndDisplayBookmarkTree = () => {
    chrome.bookmarks.getTree((bookmarks) => {
      const formattedNodes = formatNodes(bookmarks[0].children);
      setNodes(formattedNodes);
      setExpanded(formattedNodes.map((node) => node.value)); // Ensure first-level nodes are expanded by default.
    });
  };

  const formatNodes = (nodes) => {
    return nodes.map((node) => ({
      value: node.id,
      label: node.title,
      children: node.children ? formatNodes(node.children) : [],
    }));
  };

  const displayBookmarkTree = (nodes, parentElement) => {
    return nodes.map((node) => (
      <div key={node.id}>
        {node.children ? (
          <>
            <input
              type="checkbox"
              data-id={node.id}
              onChange={(e) => toggleFolderCheckbox(e.target.checked, node.id)}
              className="folder-checkbox"
            />
            {node.title}
            {displayBookmarkTree(node.children)}
          </>
        ) : (
          <>
            <input
              type="checkbox"
              data-id={node.id}
              className="bookmark-checkbox"
              onChange={() => toggleBookmarkCheckbox(node.id)}
            />
            {node.title}
          </>
        )}
      </div>
    ));
  };

  const toggleFolderCheckbox = (isChecked, folderId) => {
    let updatedFolders = [...selectedBookmarks.folders];
    if (isChecked) updatedFolders.push(folderId);
    else updatedFolders = updatedFolders.filter((id) => id !== folderId);
    setSelectedBookmarks({ ...selectedBookmarks, folders: updatedFolders });
  };

  const toggleBookmarkCheckbox = (bookmarkId) => {
    let updatedBookmarks = [...selectedBookmarks.bookmarks];
    if (updatedBookmarks.includes(bookmarkId)) {
      updatedBookmarks = updatedBookmarks.filter((id) => id !== bookmarkId);
    } else {
      updatedBookmarks.push(bookmarkId);
    }
    setSelectedBookmarks({ ...selectedBookmarks, bookmarks: updatedBookmarks });
  };

  const syncBookmarks = (selectedItems) => {
    chrome.runtime.sendMessage(
      {
        action: "processBookmarks",
        items: selectedItems,
      },
      (response) => {
        if (response.status !== "processing") {
          alert(
            "An error occurred while processing your bookmarks. Please try again."
          );
        } else {
          alert(`Processing ${selectedItems.bookmarks.length} bookmarks`);
        }
      }
    );
  };

  const isDisabled = () => {
    return (
      (!userInfo ||
        isProcessing ||
        (progressPercentage > 0 && progressPercentage < 100)) &&
      !hasError
    );
  };

  return (
    <div className="container p-4 bg-white rounded shadow-xl">
      {userInfo && (
        <div className="flex justify-center mb-2 text-md font-medium">
          Welcome {userInfo.name}
        </div>
      )}

      {!userInfo && (
        <button
          id="login-button"
          className="bg-indigo-500 w-full text-white px-4 py-2 mt-4 rounded hover:bg-indigo-600 transition-colors"
          style={{ display: !userInfo ? "inline-block" : "none" }}
          onClick={() => window.open("https://www.memfree.me/login", "_blank")}
        >
          Login
        </button>
      )}

      <div className="flex justify-center items-center">
        <button
          id="processBookmarksButton"
          className={`text-white px-4 w-full py-2 my-2 rounded ${
            isDisabled() ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-500"
          }`}
          disabled={isDisabled()}
          onClick={handleChooseookmarks}
        >
          Select Bookmarks To Index
        </button>
      </div>

      {progressPercentage > 0 && (
        <div className="progress-bar w-full h-8 bg-gray-300 mt-4 rounded relative overflow-hidden flex items-center justify-center">
          <div
            className="progress bg-indigo-500 absolute top-0 left-0 h-full"
            style={{
              width: `${progressPercentage}%`,
              transition: "width 0.4s",
            }}
          ></div>
          <span className="text-white z-10">{`Index Progress: ${progressPercentage}%`}</span>
        </div>
      )}

      {totalUrlsIndexed > 0 && (
        <div className="flex justify-center items-center result-info text-indigo-500 mt-4 text-sm font-medium">
          {`${totalUrlsIndexed} Bookmark Indexed`}
        </div>
      )}

      {hasError && (
        <div className="flex justify-center items-center result-info text-red-500 mt-4 text-sm font-medium">
          Error occurred while processing bookmarks, please try again.
        </div>
      )}

      {nodes.length > 0 && (
        <div id="bookmark-selection-container" className="mt-8">
          <h3>Select Bookmarks or Folders:</h3>
          <CheckboxTree
            nodes={nodes}
            checked={checked}
            expanded={expanded}
            icons={fontAwesomeIcons}
            showExpandAll
            onCheck={onCheck}
            onExpand={onExpand}
          />
          <button
            id="syncSelectedBookmarksButton"
            className="bg-indigo-500 text-white w-full px-4 py-2 mt-4 rounded hover:bg-indigo-600 transition-colors"
            onClick={handleSyncSelectedBookmarks}
          >
            Index Selected Bookmarks
          </button>
        </div>
      )}
    </div>
  );
}
