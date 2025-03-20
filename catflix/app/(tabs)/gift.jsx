import React, { useState, useEffect } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Feather } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const { height, width } = Dimensions.get("window");

const Explore = () => {
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please enable media access to download images.");
      }
      setHasPermission(status === "granted");
    })();
  }, []);

  const fetchNextGif = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const newGif = {
        id: Date.now().toString(),
        url: `https://cataas.com/cat/gif?${Date.now()}`,
      };
      setGifs((prev) => [...prev, newGif]);
    } catch (error) {
      console.error("Error fetching GIF:", error);
      Alert.alert("Error", "Failed to fetch GIF.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNextGif();
  }, []);

  const downloadGif = async (gifUrl) => {
    try {
      if (!hasPermission) {
        Alert.alert("Permission Required", "Enable media access to download images.");
        return;
      }

      const fileName = `cat_gif_${Date.now()}.gif`;
      const fileUri = FileSystem.cacheDirectory + fileName;

      const { uri } = await FileSystem.downloadAsync(gifUrl, fileUri);
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Downloaded GIFs", asset, false);

      Alert.alert("Download Successful", "GIF saved to gallery!");
    } catch (error) {
      console.error("Error downloading GIF:", error);
      Alert.alert("Download Failed", "Something went wrong.");
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <FlatList
          data={gifs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.url }} style={styles.gif} contentFit="cover" transition={500} />
              <TouchableOpacity onPress={() => downloadGif(item.url)} style={styles.downloadButton}>
                <Feather name="download" size={24} color="black" />
              </TouchableOpacity>
            </View>
          )}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          onEndReached={fetchNextGif}
          onEndReachedThreshold={0.1}
          ListFooterComponent={loading ? <ActivityIndicator size="large" color="blue" /> : null}
        />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  card: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
    elevation: 5,
    overflow: "hidden",
    height: height * 0.8,
    width: width * 0.95,
    justifyContent: "center",
  },
  gif: {
    width: "99%",
    height: "99%",
  },
  downloadButton: {
    backgroundColor: "lightgray",
    padding: 10,
    borderRadius: 50,
    position: "absolute",
    bottom: 20,
    right: 20,
  },
});

export default Explore;
