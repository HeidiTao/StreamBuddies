import { WatchlistDoc } from "../sample_structs";

// navigation parameters passed between pages
export type RootStackParamList = {
    Explore: undefined;
    MovieDetail: { movieId: number; title?: string };

    Search: undefined;

    Lists: undefined;
    ListDetail: {
        list: WatchlistDoc
    };
    NewList: undefined;
    
    Groups: undefined;
    Profile: undefined;
};