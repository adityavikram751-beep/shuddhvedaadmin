"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  X,
  Plus,
  Trash2,
  Equal,
  Save,
  ArrowRight,
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";

export default function ProductContentPage() {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const editorImageInputRef = useRef<HTMLInputElement | null>(null);

  // Keeps track of the last selection/cursor position inside the editor
  // so toolbar buttons (dropdown, link, image) don't lose it on click.
  const savedRangeRef = useRef<Range | null>(null);

  // Step 4: Content (InProgress)
  const currentStep = 4;

  // --- Form States ---
  const [descriptionHtml, setDescriptionHtml] = useState(
    "ShudhVeda Raw Honey is 100% pure, natural and unprocessed honey collected from wildflower nectar by our trusted beekeepers. It is rich in antioxidants, vitamins and minerals that help boost immunity and improve overall wellness. Our honey is never heated, filtered or mixed with any additives - just pure goodness in every spoon."
  );
  const [charCount, setCharCount] = useState(0);

  // Toolbar Selection Active States
  const [blockType, setBlockType] = useState("Paragraph");
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  // SEO States
  const [seoTitle, setSeoTitle] = useState(
    "Raw Honey 250g - 100% Pure & Natural Honey"
  );
  const [metaDescription, setMetaDescription] = useState(
    "Buy 100% pure and natural raw honey online. Unprocessed, chemical-free and rich in antioxidants. Boosts immunity and overall wellness."
  );
  const [seoKeywords, setSeoKeywords] = useState<string[]>([
    "raw honey",
    "pure honey",
    "natural honey",
  ]);
  const [keywordInput, setKeywordInput] = useState("");
  const [urlSlug, setUrlSlug] = useState("raw-honey-250g");

  // Highlights State
  const [highlights, setHighlights] = useState<string[]>([
    "100% Pure & Natural Honey",
    "No Added Sugar or Preservatives",
    "Unprocessed & Unheated",
    "Rich in Antioxidants",
    "Boosts Immunity & Energy",
  ]);

  // Bottom 2x2 Grid Cards State
  const [ingredients, setIngredients] = useState("100% Raw Honey (Multi Floral)");
  const [healthBenefits, setHealthBenefits] = useState(
    "• Boosts Immunity\n• Improves Digestion\n• Rich in Antioxidants\n• Provides Instant Energy"
  );
  const [usageInstructions, setUsageInstructions] = useState(
    "• Consume 1-2 teaspoons daily on an empty stomach.\n• Can be mixed with warm water, tea or milk.\n• Use as a natural sweetener in recipes."
  );
  const [storageInstructions, setStorageInstructions] = useState(
    "• Store in a cool, dry place.\n• Keep away from direct sunlight.\n• Do not refrigerate.\n• Close the lid tightly after every use."
  );

  // Toast Notification State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // --- Selection helpers ---
  // Saves the current cursor/selection position inside the editor.
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (
        editorRef.current &&
        editorRef.current.contains(range.commonAncestorContainer)
      ) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  };

  // Restores the previously saved cursor/selection position.
  const restoreSelection = () => {
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRangeRef.current);
    }
  };

  // Set Initial Content in Editor & Restore Draft on Load
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = descriptionHtml;
      updateCharCount();
    }

    const savedDraft = localStorage.getItem("product_content_draft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.descriptionHtml) {
          setDescriptionHtml(parsed.descriptionHtml);
          if (editorRef.current) editorRef.current.innerHTML = parsed.descriptionHtml;
        }
        if (parsed.seoTitle) setSeoTitle(parsed.seoTitle);
        if (parsed.metaDescription) setMetaDescription(parsed.metaDescription);
        if (parsed.seoKeywords) setSeoKeywords(parsed.seoKeywords);
        if (parsed.urlSlug) setUrlSlug(parsed.urlSlug);
        if (parsed.highlights) setHighlights(parsed.highlights);
        if (parsed.ingredients) setIngredients(parsed.ingredients);
        if (parsed.healthBenefits) setHealthBenefits(parsed.healthBenefits);
        if (parsed.usageInstructions) setUsageInstructions(parsed.usageInstructions);
        if (parsed.storageInstructions) setStorageInstructions(parsed.storageInstructions);
      } catch (e) {
        console.error("Draft error", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Character Count
  const updateCharCount = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      setCharCount(text.trim().length);
      setDescriptionHtml(editorRef.current.innerHTML);
    }
  };

  // Check Active Format States
  const checkActiveFormats = () => {
    if (typeof window !== "undefined") {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
      });
    }
  };

  // Called on keyup/mouseup inside the editor to keep the saved
  // selection in sync with whatever the user is doing.
  const handleEditorSelectionChange = () => {
    checkActiveFormats();
    saveSelection();
  };

  // --- Working Executive Format Commands ---
  const executeCmd = (e: React.MouseEvent, command: string, value: string | undefined = undefined) => {
    e.preventDefault(); // Prevents selection loss
    if (editorRef.current) {
      editorRef.current.focus();
    }
    restoreSelection();
    document.execCommand(command, false, value);
    saveSelection();
    checkActiveFormats();
    updateCharCount();
  };

  // Paragraph / Heading Handler
  const handleFormatBlock = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setBlockType(val);
    let tag = "p";
    if (val === "Heading 1") tag = "h1";
    if (val === "Heading 2") tag = "h2";
    if (val === "Heading 3") tag = "h3";

    if (editorRef.current) editorRef.current.focus();
    restoreSelection();
    document.execCommand("formatBlock", false, `<${tag}>`);
    saveSelection();
    updateCharCount();
  };

  // Insert Link Handler
  const handleInsertLink = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = prompt("Enter link URL:", "https://");
    if (url) {
      if (editorRef.current) editorRef.current.focus();
      restoreSelection();
      document.execCommand("createLink", false, url);
      showToast("Link inserted into text");
      saveSelection();
      updateCharCount();
    }
  };

  // Insert Image in Rich Editor Handler
  const handleInsertEditorImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgUrl = event.target?.result as string;
        if (editorRef.current) editorRef.current.focus();
        restoreSelection();
        document.execCommand("insertImage", false, imgUrl);
        showToast("Image inserted into description!");
        saveSelection();
        updateCharCount();
      };
      reader.readAsDataURL(file);
    }
    // Reset input so selecting the same file again still fires onChange
    e.target.value = "";
  };

  // Save Draft Handler
  const handleSaveDraft = () => {
    const draftData = {
      descriptionHtml: editorRef.current ? editorRef.current.innerHTML : descriptionHtml,
      seoTitle,
      metaDescription,
      seoKeywords,
      urlSlug,
      highlights,
      ingredients,
      healthBenefits,
      usageInstructions,
      storageInstructions,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("product_content_draft", JSON.stringify(draftData));
    showToast("Product content draft saved successfully!");
  };

  const handleContinue = () => {
    handleSaveDraft();
    showToast("Moving to Review & Publish...");
    router.push("/product/review&published");
  };

  const handleBack = () => {
    router.push("/product/mediaproduct");
  };

  // SEO Keywords Handlers
  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && keywordInput.trim()) {
      e.preventDefault();
      if (!seoKeywords.includes(keywordInput.trim())) {
        setSeoKeywords([...seoKeywords, keywordInput.trim()]);
      }
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setSeoKeywords(seoKeywords.filter((k) => k !== kw));
  };

  // Highlights Handlers
  const handleAddHighlight = () => {
    setHighlights([...highlights, "New Product Highlight"]);
    showToast("Highlight added!");
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
    showToast("Highlight removed");
  };

  const handleHighlightChange = (index: number, val: string) => {
    const updated = [...highlights];
    updated[index] = val;
    setHighlights(updated);
  };

  // Open URL Slug in new tab
  const handleOpenSlugUrl = () => {
    const fullUrl = `https://shudhveda.com/products/${urlSlug}`;
    window.open(fullUrl, "_blank");
  };

  const steps = [
    { id: 1, name: "Product Information" },
    { id: 2, name: "Pricing & Inventory" },
    { id: 3, name: "Media" },
    { id: 4, name: "Content" },
    { id: 5, name: "Review & Publish" },
  ];

  return (
    <div className="min-h-screen  text-slate-800 font-sans pb-12">

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toastMsg}
        </div>
      )}

      {/* Hidden File Input for Editor Image Insert */}
      <input
        type="file"
        ref={editorImageInputRef}
        onChange={handleInsertEditorImage}
        accept="image/*"
        className="hidden"
      />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* TOP TITLE BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Product Content
            </h1>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Add detailed product information, highlights, FAQs and SEO content.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-sm"
            >
              <Save size={14} className="text-slate-500" />
              Save as Draft
            </button>
            <button
              onClick={handleContinue}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#d9730d] hover:bg-[#c06509] text-white text-xs font-bold transition-all shadow-sm"
            >
              Continue
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between min-w-[750px] px-2">
            {steps.map((step, idx) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <React.Fragment key={step.id}>
                  <div className={`flex items-center gap-3 ${!isCompleted && !isCurrent ? "opacity-50" : ""}`}>
                    {isCompleted ? (
                      <div className="w-8 h-8 rounded-full border-2 border-[#22c55e] bg-[#e8f8ee] text-[#22c55e] font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                        <Check size={16} className="stroke-[3]" />
                      </div>
                    ) : (
                      <div
                        className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 transition-all ${
                          isCurrent
                            ? "bg-[#d9730d] text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {step.id}
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-bold text-slate-800">{step.name}</p>
                      <p
                        className={`text-[10px] font-semibold ${
                          isCompleted
                            ? "text-[#22c55e]"
                            : isCurrent
                            ? "text-amber-600"
                            : "text-slate-400"
                        }`}
                      >
                        {isCompleted ? "Completed" : isCurrent ? "InProgress" : "Pending"}
                      </p>
                    </div>
                  </div>

                  {idx < steps.length - 1 && (
                    <div
                      className={`h-[2px] w-12 shrink-0 ${
                        currentStep > step.id ? "bg-[#22c55e]" : "bg-slate-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* 1. PRODUCT DESCRIPTION CARD (FULLY WORKING RICH EDITOR) */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-4">
          <label className="block text-xs font-extrabold text-slate-800">
            Product Description <span className="text-red-500">*</span>
          </label>
          <p className="text-[11px] text-slate-400 font-medium -mt-2">
            Write a detailed description of your product.
          </p>

          <div className="rounded-2xl border border-slate-200/80 overflow-hidden bg-white">
            {/* Toolbar Buttons */}
            <div className="flex items-center gap-3 bg-[#faf8f5] border-b border-slate-200/80 px-4 py-2 text-slate-600 text-xs font-medium flex-wrap select-none">

              {/* Paragraph / Heading Selector */}
              <div className="relative pr-3 border-r border-slate-200">
                <select
                  value={blockType}
                  onMouseDown={saveSelection}
                  onChange={handleFormatBlock}
                  className="bg-transparent text-xs font-bold text-slate-800 pr-5 appearance-none focus:outline-none cursor-pointer py-1"
                >
                  <option value="Paragraph">Paragraph</option>
                  <option value="Heading 1">Heading 1</option>
                  <option value="Heading 2">Heading 2</option>
                  <option value="Heading 3">Heading 3</option>
                </select>
                <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Bold | Italic | Underline Buttons */}
              <div className="flex items-center gap-1 pr-3 border-r border-slate-200">
                <button
                  type="button"
                  onMouseDown={(e) => executeCmd(e, "bold")}
                  className={`p-1.5 rounded transition-colors ${
                    activeFormats.bold ? "bg-[#d9730d]/15 text-[#d9730d] font-black" : "hover:bg-slate-200/60 text-slate-600"
                  }`}
                  title="Bold"
                >
                  <Bold size={13} className="stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => executeCmd(e, "italic")}
                  className={`p-1.5 rounded transition-colors ${
                    activeFormats.italic ? "bg-[#d9730d]/15 text-[#d9730d] font-black" : "hover:bg-slate-200/60 text-slate-600"
                  }`}
                  title="Italic"
                >
                  <Italic size={13} className="stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => executeCmd(e, "underline")}
                  className={`p-1.5 rounded transition-colors ${
                    activeFormats.underline ? "bg-[#d9730d]/15 text-[#d9730d] font-black" : "hover:bg-slate-200/60 text-slate-600"
                  }`}
                  title="Underline"
                >
                  <Underline size={13} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Alignment Buttons */}
              <div className="flex items-center gap-1 pr-3 border-r border-slate-200">
                <button
                  type="button"
                  onMouseDown={(e) => executeCmd(e, "justifyLeft")}
                  className="p-1.5 rounded hover:bg-slate-200/60 text-slate-600 transition-colors"
                  title="Align Left"
                >
                  <AlignLeft size={13} className="stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => executeCmd(e, "justifyFull")}
                  className="p-1.5 rounded hover:bg-slate-200/60 text-slate-600 transition-colors"
                  title="Justify"
                >
                  <AlignJustify size={13} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Link & Image Insertion */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onMouseDown={saveSelection}
                  onClick={handleInsertLink}
                  className="p-1.5 rounded hover:bg-slate-200/60 text-slate-600 transition-colors"
                  title="Insert Link"
                >
                  <LinkIcon size={13} className="stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onMouseDown={saveSelection}
                  onClick={() => editorImageInputRef.current?.click()}
                  className="p-1.5 rounded hover:bg-slate-200/60 text-slate-600 transition-colors"
                  title="Insert Image"
                >
                  <ImageIcon size={13} className="stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Live Editable Text Area */}
            <div
              ref={editorRef}
              contentEditable
              onInput={updateCharCount}
              onKeyUp={handleEditorSelectionChange}
              onMouseUp={handleEditorSelectionChange}
              className="w-full min-h-[150px] p-4 text-xs font-medium text-slate-800 leading-relaxed focus:outline-none focus:ring-0 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-bold [&_a]:text-blue-600 [&_a]:underline [&_img]:max-w-xs [&_img]:my-2 [&_img]:rounded-lg"
            />
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-semibold">
              Characters: {charCount}
            </span>
          </div>
        </div>

        {/* 2. SEO SETTINGS & PRODUCT HIGHLIGHTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* SEO SETTINGS */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-xs font-extrabold text-slate-800">SEO Settings</h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Optimize your product for search engines.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                SEO Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#d9730d]"
              />
              <div className="text-right mt-1">
                <span className="text-[10px] text-slate-400 font-semibold">
                  {seoTitle.length} / 60
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Meta Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#d9730d]"
              />
              <div className="text-right mt-1">
                <span className="text-[10px] text-slate-400 font-semibold">
                  {metaDescription.length} / 160
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                SEO Keywords
              </label>
              <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl border border-slate-200 bg-white focus-within:border-[#d9730d]">
                {seoKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[#a16207] text-xs font-bold"
                  >
                    {kw}
                    <X
                      size={12}
                      className="cursor-pointer hover:text-red-500"
                      onClick={() => handleRemoveKeyword(kw)}
                    />
                  </span>
                ))}
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleAddKeyword}
                  placeholder="Add keywords and press Enter..."
                  className="flex-1 text-xs font-medium text-slate-700 focus:outline-none px-1 py-1"
                />
                <ChevronDown size={14} className="text-slate-400 mr-1 pointer-events-none" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Add keywords and press Enter.</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={urlSlug}
                onChange={(e) => setUrlSlug(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#d9730d]"
              />
              <div className="flex items-center justify-between gap-2 mt-2 text-[11px] font-semibold text-emerald-600">
                <span className="truncate">https://shudhveda.com/products/{urlSlug}</span>
                <button
                  type="button"
                  onClick={handleOpenSlugUrl}
                  className="p-1 hover:bg-emerald-50 rounded text-emerald-600 transition-colors"
                  title="Open Product URL Preview"
                >
                  <ExternalLink size={14} className="shrink-0" />
                </button>
              </div>
            </div>
          </div>

          {/* PRODUCT HIGHLIGHTS */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-xs font-extrabold text-slate-800">Product Highlights</h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Add key highlights about your product.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {highlights.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-[#faf8f5] border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 space-x-2"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Equal size={14} className="text-slate-400 shrink-0 cursor-grab" />
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleHighlightChange(index, e.target.value)}
                      className="bg-transparent text-xs font-semibold text-slate-800 w-full focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(index)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddHighlight}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-300 bg-white text-[#d9730d] text-xs font-bold hover:bg-amber-50 transition-colors shadow-sm mt-2"
            >
              <Plus size={14} />
              Add Highlight
            </button>
          </div>

        </div>

        {/* 3. INGREDIENTS, HEALTH BENEFITS, USAGE & STORAGE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-3">
            <div>
              <h2 className="text-xs font-extrabold text-slate-800">Ingredients</h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Enter all the ingredients in this product.
              </p>
            </div>
            <textarea
              rows={4}
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#d9730d]"
            />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-semibold">
                Characters: {ingredients.length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-3">
            <div>
              <h2 className="text-xs font-extrabold text-slate-800">Health Benefits</h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                List the key health benefits of this product.
              </p>
            </div>
            <textarea
              rows={4}
              value={healthBenefits}
              onChange={(e) => setHealthBenefits(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#d9730d] leading-relaxed"
            />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-semibold">
                Characters: {healthBenefits.length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-3">
            <div>
              <h2 className="text-xs font-extrabold text-slate-800">Usage Instructions</h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                How to use this product.
              </p>
            </div>
            <textarea
              rows={4}
              value={usageInstructions}
              onChange={(e) => setUsageInstructions(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#d9730d] leading-relaxed"
            />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-semibold">
                Characters: {usageInstructions.length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-3">
            <div>
              <h2 className="text-xs font-extrabold text-slate-800">Storage Instructions</h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                How to store this product.
              </p>
            </div>
            <textarea
              rows={4}
              value={storageInstructions}
              onChange={(e) => setStorageInstructions(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#d9730d] leading-relaxed"
            />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-semibold">
                Characters: {storageInstructions.length}
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM BORDERED ACTION CARD */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-sm"
            >
              <Save size={14} className="text-slate-500" />
              Save as Draft
            </button>
            <button
              onClick={handleContinue}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#d9730d] hover:bg-[#c06509] text-white text-xs font-bold transition-all shadow-sm"
            >
              Continue
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}