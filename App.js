import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert, Modal, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import { CalendarList } from 'react-native-calendars';

const STORAGE_KEY = "@toDos";

export default function App() {
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [show, setShow] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const today = new Date();
  const year = today.getFullYear();
  const month = ('0' + (today.getMonth() + 1)).slice(-2);
  const date = ('0' + today.getDate()).slice(-2);
  const [day, setDay] = useState(`${year}-${month}-${date}`);

  const [edit, setEdit] = useState(false);
  const [editText, setEditText] = useState("");

  const onChangeText = (payload) => setText(payload);
  const onChangeEditText = (payload) => setEditText(payload);

  const inputShow = () => {
    setShow(true);
  }

  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    setToDos(JSON.parse(s));
  }

  const addToDo = async () => {
    if(text === "") {
      return;
    }

    const newToDos = {...toDos, [Date.now()]: { text, day, complete: false }}
    setToDos(newToDos);

    await saveToDos(newToDos);

    setText("");
    setShow(false);
  }

  const deleteToDo = async (key) => {
    Alert.alert("Delete To Do", "Are you sure", [{ text: "Cancel" }, { text: "I'm Sure", onPress: async () => {
      const newToDos = {...toDos}
      delete newToDos[key]
      setToDos(newToDos);
      await saveToDos(newToDos);
    } }]);
    return;
  }

  const completeToDo = async (key) => {
    const completeToDo = {...toDos};
    if(completeToDo[key].complete) {
      completeToDo[key].complete = false;
    }else{
      completeToDo[key].complete = true;
    }

    delete completeToDo[key];

    setToDos(completeToDo);
    await saveToDos(completeToDo);

  }

  const editBtn = () => {
    setEdit((prev) => !prev)
  }

  const editToDo = async (key) => {
    const editTodo = {...toDos};
    editTodo[key].text = editText;

    setToDos(editTodo);
    await saveToDos(editTodo);
    setEdit(false);
  }

  useEffect(() => {
    loadToDos();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {modalVisible ? (
        <View style={styles.modalBg}></View>
      ) : null}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Pressable onPress={() => setModalVisible(!modalVisible)} style={styles.close}>
              <AntDesign name="closecircle" size={24} color="#ced4da" />
            </Pressable>
            <CalendarList
              style={{ paddingVertical: 20 }}
              horizontal={true}
              pagingEnabled={true}
              onDayPress={day => {
                setDay(day.dateString);
                setModalVisible(!modalVisible);
              }}
              theme={{
                // calendarBackground: "#fff", 
                // dayTextColor: '#fff',
                // textDisabledColor: '#343434',
                // arrowColor: "#fff",
                // textSectionTitleColor: "#fff",
                // monthTextColor: '#fff',
              }}
              markedDates={{
                [day]: {selected: true, selectedColor: '#4dabf7'},
              }}
              />
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => setModalVisible(!modalVisible)} style={{ position: 'absolute', left: 30, top: 2 }}>
          <AntDesign name="calendar" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Daily ToDos</Text>
      </View>

      <View style={styles.toDosContainer}>
        <View style={{ marginBottom: 5 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>{Object.keys(toDos).length}개의 할 일</Text>
          {/* <View style={{ backgroundColor: "#f8f9fa", marginVertical: 10, }}>
            <View style={{ backgroundColor: "#000", width: "80%", paddingVertical: 5, }}></View>
          </View> */}
          <Progress.Bar progress={(Object.keys(toDos).length) / 10} width={null} height={8} color={'#343a40'} borderRadius={0} />
        </View>

        <View style={{ flex: 1 }}>
          <ScrollView style={{ marginTop: 15}}>
            {Object.keys(toDos) && Object.keys(toDos).map((key) => (
              toDos[key].day === day ? (
                <View style={styles.toDos} key={key}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => completeToDo(key)}>
                      <MaterialCommunityIcons name={toDos[key].complete ? "check-circle" : "checkbox-blank-circle-outline"} size={24} color={toDos[key].complete ? '#51cf66' : "#868686"} />
                    </TouchableOpacity>
                    {/* <Text style={toDos[key].complete ? styles.toDoTextComplete : styles.toDoText}>{toDos[key].text}</Text> */}                  
                    {edit ? (
                      <TextInput autoFocus={true} style={{color: "#212529", backgroundColor: "#fff", flex: 0.7, padding: 3,}} onSubmitEditing={() => editToDo(key)} onChangeText={onChangeEditText} value={editText} />
                    ) : (
                      <Text style={toDos[key].complete ? styles.toDoTextComplete : styles.toDoText}>{toDos[key].text}</Text>
                      )}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => editBtn()} style={{ marginRight: 10 }}>
                      <AntDesign name="edit" size={24} color="#495057" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteToDo(key)}>
                      <MaterialIcons name="delete" size={24} color="#868e96" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.plusBtn} onPress={inputShow}>
              <AntDesign name="pluscircle" size={41} color="#51cf66" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {show ? (
        <TouchableWithoutFeedback onPress={() => {
          Keyboard.dismiss;
          setShow(false);
        }}>
          <KeyboardAvoidingView style={styles.textInput} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <TextInput onSubmitEditing={addToDo} onChangeText={onChangeText} autoFocus={show} value={text} style={styles.input} returnKeyType="done" placeholder="오늘의 할 일은?" />
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9eef3',
    // paddingHorizontal: 30,
  },
  header: {
    marginTop: 50,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  toDosContainer: {
    flex: 1,
    paddingHorizontal: 30,
  },
  toDos: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 30,
    marginBottom: 15,
  },
  inputContainer: {
    // width: '100%',
    // alignItems: 'center',
    // position: 'absolute',
    // bottom: 10,
    // left: 0,
    alignItems: 'center',
    marginBottom: 10,
  },
  plusBtn: {
    marginTop: 10,
  },
  input: {
    width: '100%',
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  textInput: {
    justifyContent: 'flex-end',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    opacity: 0.5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    flex: 1,
    // backgroundColor: "#fff",
    paddingVertical: 110,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalBg: {
    width: '100%', 
    height: '100%',
    backgroundColor: '#000', 
    opacity: 0.5,
    position: 'absolute', 
    left: 0,
    top: 0,
    zIndex: 10,
  },
  close: {
    position: 'absolute',
    right: 10,
    top: 120,
    zIndex: 100,
  },
  toDoText: {
    marginLeft: 10,
    color: '#212529',
  },
  toDoTextComplete: {
    marginLeft: 10,
    color: '#ced4da',
  }
});
