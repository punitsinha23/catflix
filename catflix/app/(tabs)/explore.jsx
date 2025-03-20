import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

// Function to shuffle the images (so they're randomly arranged)
const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

const AnimalGallery = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // Request media library permission
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Fetch cats and dogs
  const fetchAnimals = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const [dogResponse, catResponse] = await Promise.all([
        fetch("https://dog.ceo/api/breeds/image/random/5"), // Fetch 5 random dogs
        fetch("https://api.thecatapi.com/v1/images/search?limit=5"), // Fetch 5 random cats
      ]);

      const dogData = await dogResponse.json();
      const catData = await catResponse.json();

      const newDogs = dogData.message.map((imageUrl, index) => ({
        id: `dog-${Date.now()}-${index}`, // Unique ID
        image: imageUrl,
      }));

      const newCats = catData.map((item, index) => ({
        id: `cat-${Date.now()}-${index}`, 
        image: item.url,
      }));

     
      setAnimals((prev) => shuffleArray([...prev, ...newDogs, ...newCats]));
    } catch (error) {
      Alert.alert("Error", "Failed to load images.");
    }

    setLoading(false);
  };

  // Fetch initial images
  useEffect(() => {
    fetchAnimals();
  }, []);

  // Download image function
  const downloadImage = async (imageUrl) => {
    if (!hasPermission) {
      Alert.alert("Permission Required", "Enable media access to download images.");
      return;
    }

    try {
      const fileName = imageUrl.split("/").pop();
      const fileUri = FileSystem.cacheDirectory + fileName;
      const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Animal Gallery", asset, false);
      Alert.alert("Download Successful", "Image saved to gallery!");
    } catch (error) {
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
            <TouchableOpacity
              onPress={() => downloadImage(item.image)}
              style={styles.downloadButton}
            >
              <Feather name="download" size={24} color="black" />
            </TouchableOpacity>
          </View>
        )}
        onEndReached={fetchAnimals} // Fetch more images when scrolling
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="large" color="blue" /> : null}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
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
  downloadButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 5,
  },
});

export default AnimalGallery;
