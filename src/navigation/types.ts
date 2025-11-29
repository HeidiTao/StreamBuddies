import { WatchlistDoc, GroupDoc } from "../sample_structs";
import type { MediaType, MediaItem } from "../screens/Swipe/useExploreSwiper";

// navigation parameters passed between pages
export type RootStackParamList = {
    Explore: undefined;
    MovieDetail: {
    id: number;
    title: string;
    mediaType: "movie" | "tv";
    };
    Trending:undefined;
    Search: undefined;
    LikeConfirmation: { movie: MediaItem };
    Lists: undefined;
    ListDetail: {
        list: WatchlistDoc
    };
    NewList: undefined;
    
    Groups: undefined;
    GroupDetail: {
        group: GroupDoc
    };
    JoinGroup: undefined;
    NewGroup: undefined;
    Profile: undefined;
};