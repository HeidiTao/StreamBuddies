import { WatchlistDoc, GroupDoc } from "../sample_structs";

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
    GroupDetail: {
        group: GroupDoc
    };
    JoinGroup: undefined;
    NewGroup: undefined;

    Profile: undefined; //{ // wait the auth stuff could probably just handle userId
    //     userId: string,
    // }
    LogIn: undefined;
    // SignedInProfile: {
    //     userId: number;
    // };
    Register: {
        phone: string;
    };
};