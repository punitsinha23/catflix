import { Text, View, StyleSheet, ImageBackground, Pressable } from 'react-native';
import { Link } from 'expo-router';


const bgImage = { uri: 'https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MTl8fHxlbnwwfHx8fA%3D%3D&w=1000&q=80' };


const Home = () => {
  return (
    <View style={styles.container}>
      <ImageBackground source={bgImage} style={styles.image} resizeMode="cover">
        <View style={styles.overlay}> 
        <Text style={styles.title}>
  Welcome to{" "}
  <Text style={styles.pet}>Pet</Text>
  <Text style={styles.flix}>Flix</Text>
</Text>


          <Text style={styles.subtitle}>A perfect place for pet lovers</Text>

          <Link href="/explore" asChild>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Explore</Text>
            </Pressable>
          </Link>
        </View>
      </ImageBackground>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',  
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  subtitle: {
    fontSize: 18,
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    height: 50,
    width: 180,
    backgroundColor: 'mediumseagreen',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
    marginBottom: 10,
  },
  pet: {
    color: "red",
    fontSize: 32, 
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  flix: {
    color: "purple",
    fontSize: 32,
    fontWeight: "bold",
    
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },

});
