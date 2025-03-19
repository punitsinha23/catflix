import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

const Explore = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [likedAnimals, setLikedAnimals] = useState({});
  const [hasPermission, setHasPermission] = useState(false);

  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please enable media access to download images.");
      }
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    if (params.liked) {
      setLikedAnimals(JSON.parse(params.liked));
    }
  }, [params.liked]);

  const toggleLike = (animal) => {
    setLikedAnimals((prev) => {
      const updatedLikes = { ...prev };
      if (updatedLikes[animal.id]) {
        delete updatedLikes[animal.id];
      } else {
        updatedLikes[animal.id] = animal;
      }
      return updatedLikes;
    });
  };

  const fetchAnimals = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const newCats = Array.from({ length: 3 }, (_, index) => ({
        id: `cat_${Date.now()}_${index}`,
        image: `https://cataas.com/cat/gif?random=${Date.now()}_${index}`,
        name: "Cat gifs",
      }));

      setAnimals((prev) => [...prev, ...newCats]);
    } catch (error) {
      console.error("Error fetching cat GIFs:", error);
      Alert.alert("Fetch Error", "Failed to load cat GIFs.");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  const downloadImage = async (imageUrl) => {
    try {
      if (!hasPermission) {
        Alert.alert("Permission Required", "Enable media access to download images.");
        return;
      }
      const fileName = imageUrl.split("/").pop();
      const fileUri = FileSystem.cacheDirectory + fileName;
      const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Downloaded Images", asset, false);
      Alert.alert("Download Successful", "Image saved to gallery!");
    } catch (error) {
      console.error("Error downloading image:", error);
      Alert.alert("Download Failed", "Something went wrong.");
    }
  };

  return (
    <View style={styles.container}>

      <FlatList
        data={animals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.name}>{item.name.toUpperCase()}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => toggleLike(item)} style={styles.likeButton}>
                <AntDesign name={likedAnimals[item.id] ? "heart" : "hearto"} size={24} color={likedAnimals[item.id] ? "red" : "gray"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => downloadImage(item.image)} style={styles.downloadButton}>
                <Feather name="download" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        onEndReached={fetchAnimals}
        onEndReachedThreshold={0.7}
        ListFooterComponent={loading ? <ActivityIndicator size="large" color="blue" /> : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  viewLikedButton: {
    backgroundColor: "tomato",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  viewLikedText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    alignItems: "center",
    elevation: 5,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "cover",
    borderRadius: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 10,
  },
 
});

export default Explore;