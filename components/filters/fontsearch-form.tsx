"use client";
import '@/app/styles/form.scss';
import { useFontSearch } from "@/components/effects/fetch-fonts";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Schema } from "effect";
import { ArrayFormatter } from "effect/ParseResult";
import { FontFilter, FontRow, SiteFilter, SiteRow } from "@/types/schema";
import { Dropdown, DropdownAggregate } from '@/components/filters/dropdown';
import Toggle from '@/components/filters/toggle';
import Pagination from '@/components/display/pagination';
import CytoscapeGraph from '@/components/graph/graph';
import DisplayNav, { TagType } from '@/components/display/sitefontinspector';
import { useSiteSearch } from '../effects/fetch-font-sites';
import Block from '@/components/display/fontblock';

type SearchValType = "title+desc" | "only title" | "only description";
type SearchFieldType = "td" | "t" | "d";
type SortValType = "popularity, desc" | "popularity, asc" | "a → z" | "z → a";
type SortByType = "popHL" | "popLH" | "fontAZ" | "fontZA";
export type BubbleSortType = "classification" | "style_tags" | "subsets" | "categories";

const CLASSIFICATION_FILTER: FontFilter = { bubbleSort: "classification", page: 1 };
const SUBSETS_FILTER: FontFilter = { bubbleSort: "subsets", page: 1 };
const STYLES_FILTER: FontFilter = { bubbleSort: "style_tags", page: 1 };
const CATEGORY_FILTER: FontFilter = { bubbleSort: "categories", page: 1 };

const INIT_ROW_FILTER: FontFilter = { page: 1, sortBy: "popHL" };

export default function FontSearchForm() {
  // --- form fields ---
  const [ searchString, setSearchString ] = useState<string>("");
  const [ searchVal, setSearchVal ] = useState<SearchValType>("title+desc");
  const [ classification, setClassification ] = useState<string>("");
  const [ styles, setStyles ] = useState<string[]>([]);
  const [ subsets, setSubsets ] = useState<string[]>([]);
  const [ styleOr, setStyleOr ] = useState<boolean>(true);
  const [ subsetOr, setSubsetOr ] = useState<boolean>(true);
  const [ sortVal, setSortVal ] = useState<SortValType>("popularity, desc");
  const [ sortBy, setSortBy ] = useState<SortByType>("popHL");
  const [ bubbleSort, setBubbleSort ] = useState<BubbleSortType>("classification");

  const [ searchingFonts, setSearchingFonts ] = useState(true);
  const [ category, setCategory ] = useState<string>("");
  const [ lastTag, setLastTag ] = useState<{ type: BubbleSortType; label: string } | null>(null);

  // --- paging / view ---
  const [ pageIn, setPageIn ] = useState<number>(1);
  const [ viewMode, setViewMode ] = useState<boolean>(false); // false = row, true = bubble

  const [ formError, setFormError ] = useState<string | null>(null);

  const [ rowParams, setRowParams ] = useState<FontFilter | SiteFilter | null>(INIT_ROW_FILTER);
  const [ bubbleParams, setBubbleParams ] = useState<FontFilter | SiteFilter | null>(null);

  const [ selectedResult, setSelectedResult ] = useState<FontRow | SiteRow | null>(null);

  const [ menuOpen, setMenuOpen ] = useState<boolean>(false);

  const searchField: SearchFieldType = useMemo(
    () => (searchVal === "title+desc" ? "td" : searchVal === "only title" ? "t" : "d"),
    [searchVal]
  );

  const buildBaseFilter = () => ({
    searchString,
    classification: classification || undefined,
    styles,
    subsets,
    styleOr,
    subsetOr,
    sortBy,
    searchField,
  });

  const buildBaseSiteFilter = () => ({
    searchString,
    category: category || undefined,
    sortBy,
  });

  const reportDecodeError = useCallback(
    (left: Parameters<typeof ArrayFormatter.formatErrorSync>[0]) => {
      setFormError(ArrayFormatter.formatErrorSync(left)[0]?.message ?? "Invalid input.");
    },
    []
  );

  const submitRow = (page: number) => {
    const result =
      searchingFonts ?
      Schema.decodeUnknownEither(FontFilter)({ ...buildBaseFilter(), page })
      : Schema.decodeUnknownEither(SiteFilter)({ ...buildBaseSiteFilter(), page });
    if (result._tag === "Left") {
      reportDecodeError(result.left);
      return false;
    }
    setFormError(null);
    setRowParams(result.right);
    setPageIn(page);
    return true;
  };

  const submitBubble = (removeTag?: { type: BubbleSortType; label: string }) => {
    const newStyles =
      removeTag?.type === "style_tags" ? styles.filter((s) => s !== removeTag.label) : styles;
    const newSubsets =
      removeTag?.type === "subsets" ? subsets.filter((s) => s !== removeTag.label) : subsets;
    const newClassification =
      removeTag?.type === "classification" ? "" : classification;
    const newCategory =
      removeTag?.type === "categories" ? "" : category;

    const result = searchingFonts
      ? Schema.decodeUnknownEither(FontFilter)({
          searchString,
          classification: newClassification || undefined,
          styles: newStyles,
          subsets: newSubsets,
          styleOr,
          subsetOr,
          sortBy,
          searchField,
          page: 1,
          bubbleSort,
        })
      : Schema.decodeUnknownEither(SiteFilter)({
          searchString,
          category: newCategory || undefined,
          sortBy,
          page: 1,
          bubbleSort: "categories",
        });

    if (result._tag === "Left") {
      reportDecodeError(result.left);
      return false;
    }

    setFormError(null);
    if (removeTag) {
      if (removeTag.type === "style_tags") setStyles(newStyles);
      if (removeTag.type === "subsets") setSubsets(newSubsets);
      if (removeTag.type === "classification") setClassification(newClassification);
      if (removeTag.type === "categories") setCategory(newCategory);
      setLastTag(null);
    }
    setBubbleParams(result.right);
    return true;
  };

  const submit = (paging?: 'next' | 'back') => {
    if (viewMode) {
      setRowParams(null);
      submitBubble();
      return;
    }
    const page = paging ? (paging === 'next' ? pageIn + 1 : pageIn - 1) : 1;
    setBubbleParams(null);
    submitRow(page);
  };

  const handleViewSwitch = () => {
    const switchingToBubble = !viewMode;
    if (switchingToBubble && bubbleParams === null) {
      submitBubble();
    } else if (!switchingToBubble && rowParams === null) {
      submitRow(1);
    }
    setViewMode(switchingToBubble);
  };

  const {
    data: results,
    error,
    isError,
    isFetching,
    refetch,
  } = searchingFonts ? useFontSearch(rowParams) : useSiteSearch(rowParams);

  const { data: bubbleResults } = searchingFonts ? useFontSearch(bubbleParams) : useSiteSearch(bubbleParams);

  const { data: classResults } = useFontSearch(CLASSIFICATION_FILTER);
  const { data: subsetResults } = useFontSearch(SUBSETS_FILTER);
  const { data: styleResults } = useFontSearch(STYLES_FILTER);
  const { data: categoryResults } = useSiteSearch(CATEGORY_FILTER);

  const classifications = useMemo(
    () => (classResults?._tag === "BubbleFontResult" ? classResults.data.map(i => `${i.label}`) : []),
    [classResults]
  );
  const stylesList = useMemo(
    () => (styleResults?._tag === "BubbleFontResult" ? styleResults.data.map(i => `${i.label}`) : []),
    [styleResults]
  );
  const subsetsList = useMemo(
    () => (subsetResults?._tag === "BubbleFontResult" ? subsetResults.data.map(i => `${i.label}`) : []),
    [subsetResults]
  );
  const categories = useMemo(
    () => (categoryResults?._tag === "BubbleSiteResult" ? categoryResults.data.map(i => `${i.label}`) : []),
    [categoryResults]
  );

  const queryFull = useMemo(
    () => [
      classification && `classification: ${classification};`,
      styles.length > 0 && `styles: ${styles.join(styleOr ? ' or ' : ' and ')};`,
      subsets.length > 0 && `subsets: ${subsets.join(subsetOr ? ' or ' : ' and ')};`,
      searchString.length > 0 && `contains ${searchString} in ${searchVal};`,
      `ordered by ${sortVal}`,
    ].filter(Boolean).join(' '),
    [classification, styles, styleOr, subsets, subsetOr, searchString, searchVal, sortVal]
  );

  const queryFullSites = useMemo(
    () => [
      category && `category: ${category};`,
      searchString.length > 0 && `contains ${searchString};`,
      `ordered by ${sortVal}`,
    ].filter(Boolean).join(' '),
    [category, searchString, sortVal]
  );

  const handleSortSelect = (selected: SortValType) => {
    setSortVal(selected);
    switch (selected) {
      case "popularity, desc": setSortBy("popHL"); break;
      case "popularity, asc": setSortBy("popLH"); break;
      case "a → z": setSortBy("fontAZ"); break;
      case "z → a": setSortBy("fontZA"); break;
      default: setSortBy("popHL");
    }
  };

  // `mode` lets callers reset toward a target mode (e.g. right before a font/site
  // switch) instead of the mode currently in state, avoiding a second corrective
  // setBubbleSort call afterward.
  const clearFilters = useCallback((mode: boolean = searchingFonts) => {
    setSearchString("");
    setSearchVal("title+desc");
    setClassification("");
    setStyles([]);
    setSubsets([]);
    setStyleOr(true);
    setSubsetOr(true);
    setSortVal("popularity, desc");
    setSortBy("popHL");
    setCategory("");
    setLastTag(null);
    setBubbleSort(mode ? "classification" : "categories");
  }, [searchingFonts]);

  const formStateRef = useRef({
    searchString,
    classification,
    styles,
    subsets,
    styleOr,
    subsetOr,
    sortBy,
    searchField,
    category,
  });

  useEffect(() => {
    formStateRef.current = {
      searchString,
      classification,
      styles,
      subsets,
      styleOr,
      subsetOr,
      sortBy,
      searchField,
      category,
    };
  });

  const tagCallback = useCallback(
    (data: TagType, clearBefore: boolean) => {
      const state = formStateRef.current;
      if (data.type == "style_tags" && state.styles.includes(data.label))
        return;
      if (data.type == "subsets" && state.subsets.includes(data.label))
        return;

      if (clearBefore) {
        clearFilters(true);
        setViewMode(false);
      }
      setSearchingFonts(true);

      const newClassification =
        data.type === "classification" ? data.label : clearBefore ? "" : state.classification;
      const newStyles =
        data.type === "style_tags" ? [data.label] : clearBefore ? [] : state.styles;
      const newSubsets =
        data.type === "subsets" ? [data.label] : clearBefore ? [] : state.subsets;

      setClassification(newClassification);
      setStyles(newStyles);
      setSubsets(newSubsets);
      setLastTag({ type: data.type as BubbleSortType, label: data.label });

      const result = Schema.decodeUnknownEither(FontFilter)({
        searchString: clearBefore ? "" : state.searchString,
        classification: newClassification,
        styles: newStyles,
        subsets: newSubsets,
        styleOr: clearBefore ? true : state.styleOr,
        subsetOr: clearBefore ? true : state.subsetOr,
        sortBy: clearBefore ? "popHL" : state.sortBy,
        searchField: clearBefore ? "td" : state.searchField,
        page: 1,
      });

      if (result._tag === "Left") {
        reportDecodeError(result.left);
        return;
      }
      setFormError(null);
      setBubbleParams(null);
      setPageIn(1);
      setRowParams(result.right);
    },
    [clearFilters, reportDecodeError]
  );

  const catCallback = useCallback(
    (cat: string, clearBefore: boolean) => {
      const state = formStateRef.current;

      if (clearBefore) {
        clearFilters(false);
        setViewMode(false);
      }
      setSearchingFonts(false);
      setCategory(cat);
      setLastTag({ type: "categories", label: cat });

      const result = Schema.decodeUnknownEither(SiteFilter)({
        searchString: clearBefore ? "" : state.searchString,
        category: cat,
        sortBy: clearBefore ? "popHL" : state.sortBy,
        page: 1,
      });

      if (result._tag === "Left") {
        reportDecodeError(result.left);
        return;
      }
      setFormError(null);
      setBubbleParams(null);
      setPageIn(1);
      setRowParams(result.right);
    },
    [clearFilters, reportDecodeError]
  );

  const handleSearchModeToggle = useCallback(() => {
    const next = !searchingFonts;
    setSearchingFonts(next);
    clearFilters(next);
    setPageIn(1);
    setRowParams(INIT_ROW_FILTER);
    setBubbleParams(next ? CLASSIFICATION_FILTER : CATEGORY_FILTER);
  }, [searchingFonts, clearFilters]);

  const graphData = bubbleParams ? bubbleResults : results;

  // Skip the initial mount (INIT_ROW_FILTER already covers it) and only react
  // to bubbleSort changes while the bubble/graph view is actually showing —
  // otherwise this would clobber params that mode-switching just set.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (viewMode) submitBubble();
  }, [bubbleSort]);

  return (
    <>
      <div className={`right-stack ${!menuOpen ? 'menu-hidden' : ''}`}>
        <div className='search-row'>
          <button
            type="button"
            className='text submit'
            onClick={handleSearchModeToggle}
          >
            {searchingFonts ? "(browsing fonts)" : "(browsing sites)"}
          </button>
        </div>
        <form onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          submit();
        }}>

          {searchingFonts ?
            <>
              <div className='search-col'>
                <div className='text'>classification</div>
                <div className='search-row'>
                  <Dropdown
                    title=""
                    value={classification}
                    options={classifications}
                    setterCallback={setClassification}
                  />
                </div>
              </div>
              <div className='search-col'>
                <div className='text'>styles</div>
                <DropdownAggregate title='' options={stylesList} value={styles} setterCallback={setStyles} />
                {styles.length > 1 && <Toggle
                  value={styleOr}
                  setterCallback={setStyleOr}
                  str1="inclusive"
                  str2="exclusive"
                />}
              </div>
              <div className='search-col'>
                <div className='text'>subsets</div>
                <DropdownAggregate title='' options={subsetsList} value={subsets} setterCallback={setSubsets} />
                {subsets.length > 1 && <Toggle
                  value={subsetOr}
                  setterCallback={setSubsetOr}
                  str1="inclusive"
                  str2="exclusive"
                />}
              </div>
            </> :
            <div className='search-col'>
              <div className='text'>category</div>
              <div className='search-row'>
                <Dropdown
                  title=""
                  value={category}
                  options={categories}
                  setterCallback={setCategory}
                />
              </div>
            </div>
          }
          <div className='search-col'>
            <div className='search-row'>
            <div className='text'>
              filter
            </div>
            {searchingFonts && <Dropdown
                title="title+desc"
                value={searchVal}
                options={["title+desc", "only title", "only description"]}
                setterCallback={setSearchVal}
                removeNegate
                removeRemove
              />}
            </div>
            
            <div className='search-row'>
              <input
                type="text"
                id="searchstring"
                value={searchString}
                placeholder='contains…'
                onChange={(e) => setSearchString(e.target.value)}
              />
              
              {searchString.length > 0 &&
                <button
                    type="button"
                    className="text button-not img-btn"
                    onClick={() => setSearchString('')}
                >
                    ×
                </button>
              }
            </div>
          </div>
          <div className='search-col'>
            <div className='text'>order</div>
            <Dropdown
              title={sortVal}
              value={sortVal}
              options={["popularity, desc", "popularity, asc", "a → z", "z → a"]}
              setterCallback={handleSortSelect}
              removeNegate
              removeRemove
            />
          </div>

          {formError && <p>{formError}</p>}
          <div className='text' style={{flexGrow: 1, width: '100%'}}></div>
        </form>

        <div className='search-col'>
          <div className='search-row text' style={{width: 'auto'}}>
            {searchingFonts ? queryFull : queryFullSites}
          </div>
          <div className='search-row'>
            <button type="submit" className='text submit' disabled={isFetching} onClick={() => submit()}>
              search
            </button>
            <button type="button" className='text' disabled={isFetching} onClick={() => clearFilters()}>
              clear
            </button>
          </div>
          {isError && (
            <div>
              <button
                className='text'
                style={{pointerEvents: 'none'}}
              >
                {error instanceof Error ? error.message : "Something went wrong."}
              </button>
              <button onClick={() => refetch()}>Retry</button>
            </div>
          )}
        </div>
      </div>
      <div className='left-container'>
        <div className='left-split'>
          <div className={`left-stack ${selectedResult ? 'left-split-small' : 'left-split-large'}`}>
            <div className='search-row bubble-header'>
              <button
                type='button'
                className='text mobile-only'
                onClick={() => setMenuOpen((o) => !o)}
              >
                {menuOpen ? "(hide filters)" : "(show filters)"}
              </button>
              <button
                type='button'
                className='text'
                onClick={handleViewSwitch}
              >
                (switch view)
              </button>
              {(viewMode && searchingFonts) &&
                <Dropdown
                  title={bubbleSort}
                  value={bubbleSort}
                  options={["classification", "style_tags", "subsets"]}
                  setterCallback={setBubbleSort}
                  removeNegate
                  removeRemove
                />
              }
            </div>
            {isFetching ?
              <div className='text fillbox'/> :
              !viewMode
                ? (results?._tag === "RowFontResult" || results?._tag == "RowSiteResult") && (
                    <div className='boxes'>
                      {results.data.map((row, i) => (
                        <Block
                          row={row}
                          index={i}
                          setter={async () => setSelectedResult(row)}
                          selected={selectedResult == row}
                          key={i}
                        />
                      ))}
                      {results.data.length == 0 && (
                        <div className='search-row'>
                            no results found
                        </div>)}
                    </div>
                  )
                  : viewMode && (
                    <CytoscapeGraph
                      fontdata={graphData}
                      tagCallback={tagCallback}
                      catCallback={catCallback}
                      filter={bubbleSort}
                      setter={setSelectedResult}
                      onBack={() => submitBubble(lastTag ?? undefined)}
                    />
                )
              }
            {!viewMode && <Pagination submit={submit} results={results} pageIn={pageIn} disabled={isFetching}/>}
          </div>
          {selectedResult &&
            <DisplayNav
              current={selectedResult}
              tagCallback={tagCallback}
              catCallback={catCallback}
              closeInspector={() => setSelectedResult(null)}
            />
          }
        </div>
      </div>
    </>
  );
}