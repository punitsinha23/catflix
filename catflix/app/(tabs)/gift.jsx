import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
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
  const [refreshing, setRefreshing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      await requestPermissions();
      await fetchNextGifs(); // Initial fetch
    })();
  }, []);

  const requestPermissions = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const fetchNextGifs = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const newGifs = await Promise.all(
        Array.from({ length: 3 }).map(async () => {
          const timestamp = Date.now();
          return {
            id: `${timestamp}-${Math.random().toString(36).substring(7)}`,
            url: `https://cataas.com/cat/gif?${timestamp}`,
          };
        })
      );

      setGifs((prev) => [...prev, ...newGifs]);
    } catch (error) {
      console.error("Error fetching GIFs:", error);
      Alert.alert("Error", "Failed to fetch GIFs.");
    } finally {
      setLoading(false);
    }
  };

  const refreshGifs = async () => {
    setRefreshing(true);
    setGifs([]); // Clear old GIFs before refreshing
    await fetchNextGifs();
    setRefreshing(false);
  };

  const downloadGif = async (gifUrl) => {
    if (!hasPermission) {
      await requestPermissions();
      if (!hasPermission) {
        Alert.alert("Permission Required", "Enable media access to download images.");
        return;
      }
    }

    try {
      const fileName = `cat_gif_${Date.now()}.gif`;
      const fileUri = FileSystem.cacheDirectory + fileName;

      const { uri } = await FileSystem.downloadAsync(gifUrl, fileUri);
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Downloaded GIFs", asset, false);

      Alert.alert("Success", "GIF saved to gallery!");
    } catch (error) {
      console.error("Error downloading GIF:", error);
      Alert.alert("Download Failed", "Something went wrong.");
    }
  };

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.card}>
        <Image source={{ uri: item.url }} style={styles.gif} contentFit="cover" transition={500} />
        <TouchableOpacity onPress={() => downloadGif(item.url)} style={styles.downloadButton}>
          <Feather name="download" size={24} color="black" />
        </TouchableOpacity>
      </View>
    ),
    []
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <FlatList
          data={gifs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          onEndReached={fetchNextGifs}
          onEndReachedThreshold={0.2}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshGifs} />}
          ListFooterComponent={loading ? <ActivityIndicator size="large" color="blue" /> : null}
          windowSize={5}
          removeClippedSubviews={true}
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
    width: width * 0.95,
    height: height * 0.5,
    justifyContent: "center",
  },
  gif: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
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
