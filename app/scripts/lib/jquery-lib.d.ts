interface JQuery {
    rect(): ClientRect;
    isContainedBy(containerElement: HTMLElement|JQuery): boolean;
    containedBy(containerElement: HTMLElement|JQuery): JQuery;
    rectFilter(rectFilterOption: rectFilterOption): JQuery;
    isEmpty(): boolean;
    //jqueryの型定義が.has(jqueryオブジェクト)を受け付けないのでここで定義しておく
    has(selector: string|Element|JQuery): JQuery;
}
interface rectFilterOption{
    left14l?: boolean;
    left12l?: boolean;
    left12r?: boolean;
    left34r?: boolean;
    right14r?: boolean;
    right14l?: boolean;
    right12r?: boolean;
    right12l?: boolean;
    right34l?: boolean;
    top14u?: boolean;
    top12u?: boolean;
    top12d?: boolean;
    top34d?: boolean;
    bottom14u?: boolean;
    bottom12u?: boolean;
    bottom12d?: boolean;
    bottom34d?: boolean;
    width12s?: boolean;
    width12b?: boolean;
    width14s?: boolean;
    width14b?: boolean;
    width34s?: boolean;
    width34b?: boolean;
    height14s?: boolean;
    height14b?: boolean;
    height12s?: boolean;
    height12b?: boolean;
    height34s?: boolean;
    height34b?: boolean;
    notBodyParent?: boolean;
    display?: string;
    displayNot?: string;
    filters?: Array<(element: HTMLElement) => boolean>;
}