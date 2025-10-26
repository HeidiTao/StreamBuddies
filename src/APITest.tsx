import { useState, useEffect } from "react";
import { Touchable, TouchableOpacity, View, Text, ScrollView, TextInput } from "react-native";
// import TMDB_READ_TOKEN from "@env";
import { db } from "../config/firebase";

const APITest: React.FC = () =>  {
    const [movie, setMovie] = useState(null);
    const [mvID, setMvID] = useState(11);

    const tmdb_token = process.env.EXPO_PUBLIC_TMDB_READ_TOKEN;
    const tmdb_api_key = process.env.EXPO_PUBLIC_TMDB_API_KEY;
    const APIURL = `https://api.themoviedb.org/3/movie/${mvID}?api_key=${tmdb_api_key}`;

    console.log("TMDB TOKEN", tmdb_token);
    console.log("TMDB API KEY", tmdb_api_key);
    
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            // Authorization: `Bearer ${tmdb_token}`
            // api_key: tmdb_api_key,
        }
    };

    const getMovie = async () => {
        const res = await fetch(APIURL, options);
        const data = await res.json();
        setMovie(data);
        console.log("data", data);
    }

    useEffect(() => {
        getMovie();
    }, []);

    console.log(movie);

    return (
        <View>
            <TextInput style={{ marginTop: 80, margin:20, padding: 15, backgroundColor: 'lightsteelblue'}}
                placeholder="Search..."
                value={mvID}
                onChangeText={(text) => setMvID(parseFloat(text))}
            />
            <TouchableOpacity
                onPress={() => getMovie()}
            >
                <Text style={{ margin: 20, padding: 15, backgroundColor: 'lightblue' }}>Get movie info</Text>
            </TouchableOpacity>

            {/* with gemini */}
            {movie ? (
            <ScrollView>
                <Text style={{ fontWeight: 'bold' }}>Title:</Text>
                <Text>{movie.title}</Text>
                <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Release Date:</Text>
                <Text>{movie.release_date}</Text>
                <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Overview:</Text>
                <Text>{movie.overview}</Text>
                
                {/* Optional: Show all JSON data for debugging */}
                <Text style={{ marginTop: 20 }}>Full JSON:</Text>
                <Text style={{ fontSize: 10 }}>{JSON.stringify(movie, null, 2)}</Text>
            </ScrollView>
            ) : (
                <Text>Data is loading or not yet fetched...</Text>
            )}
        </View>
    )
}

export default APITest;