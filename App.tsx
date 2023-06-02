/* eslint-disable react-native/no-inline-styles */

/* eslint-disable prettier/prettier */

import React,{useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Linking,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';

import { PermissionsAndroid, Platform } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

// Define um componente App que será o componente raiz do aplicativo
const App = () => {
  // Cria uma referência para o componente Camera usando o hook useRef
  const camera = useRef<Camera>(null);

  // Usa o hook useCameraDevices para obter uma lista de dispositivos de câmera disponíveis
  const devices = useCameraDevices();

  // Usa o hook useState para criar um estado para controlar a visibilidade do modal
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Usa o hook useState para criar um estado para armazenar o URI da foto tirada
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);

  // Seleciona o dispositivo de câmera traseira da lista de dispositivos disponíveis
  const device = devices.back;

  // Define uma função assíncrona para verificar se o aplicativo tem permissão para acessar a galeria de fotos no Android
  async function hasAndroidPermission() {
    // Verifica a versão da plataforma Android e seleciona a permissão apropriada
    const permissionRoll = parseInt(Platform.Version as string, 10) >= 33 ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    // Verifica se o aplicativo já tem a permissão necessária
    const hasPermission = await PermissionsAndroid.check(permissionRoll);
    if (hasPermission) {
      return true;
    }

    // Solicita a permissão ao usuário
    const status = await PermissionsAndroid.request(permissionRoll);
    return status === 'granted';
  }

  // Usa o hook useEffect para solicitar permissão para acessar a câmera quando o componente é montado
  useEffect(()=>{
    async function getPermission() {
      const permission = await Camera.requestCameraPermission();
      console.log(`Camera permission status: ${permission}`);
      if (permission === 'denied'){
        await Linking.openSettings();
      }
    }
    getPermission();
  },[]);

  // Define uma função assíncrona para tirar uma foto com a câmera e salvar na galeria do dispositivo
  const takePicture = async () => {
    try {
      if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
        return;
      }
      if (device) {
        const photo = await camera.current?.takePhoto({ });
        if (photo) {
          const savedPhotoUri = await CameraRoll.save(photo.path, { type: 'photo' });
          setPhotoUri(savedPhotoUri);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Verifica se um dispositivo de câmera está disponível
  if (device == null){
    return <Text>sem dispositivo</Text>;
  }

  // Renderiza a interface do usuário do aplicativo
  return (
    <SafeAreaView>
      <Camera
        ref={camera}
        style={{width:500, height: 500}}
        device={device}
        isActive={true}
        photo={true}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={takePicture}
      >
        <Text style={styles.buttonText}>Tirar foto</Text>
      </TouchableOpacity>
      {photoUri && (
        <>
          <TouchableOpacity onPress={()=>setIsModalVisible(true)}>
            <Image source={{ uri: photoUri }} style={styles.thumbnail} />
          </TouchableOpacity>
          <Modal
            visible={isModalVisible}
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <Image source={{ uri: photoUri }} style={styles.modalImage} />
              <View style={styles.closeButtonContainer}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  thumbnail: {
    width: 100,
    height: 100,
    position: 'absolute',
    bottom: -250,
    left: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  closeButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'black',
    fontSize: 30,
  },
});

export default App;
