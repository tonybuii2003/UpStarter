# Upstarter App Requirements

## About the app (Upstarter)

Upstarter is envisioned as a "Tinder-like" platform designed to connect individuals for two primary purposes: finding co-founders or joining a startup. The core concept revolves around facilitating connections and providing a robust environment for newly formed ventures.

**Key User Flows & Features:**

* **Cofounder Matching:** Users seeking co-founders can match with other individuals. Once two users agree to become co-founders, a new "project workspace" section is unlocked for them.

* **Startup Workspace:** This dedicated area serves as a collaborative hub for co-founders. It includes functionalities for:

    * Matching with potential candidates (e.g., volunteers, early team members).

    * Interacting with investors.

    * Inviting other individuals to join the workspace.

* **Automation & AI Agents:** The app will leverage automation and AI agents for various tasks, including:

    * **Right-fit assessment:** Training classifiers or utilizing agents to help assess the compatibility between potential co-founders or candidates.

    * **Automating tasks:** Streamlining processes within the project workspace.

* **Investor/VC Mode:** Investors and VCs have a distinct perspective and functionality:

    * Ability to filter and discover promising projects/startups.

    * Option to initiate conversations with existing startups.

    * Integration of relevant AI automation tools specifically tailored for investor needs.

**Vision for Upstarter:**

Upstarter aims to create a continuous pipeline for startups by providing an environment that simplifies:

* Startup formation.

* Finding volunteers (beneficial for individuals seeking experience or early involvement in successful ventures).

* Facilitating funding conversations (attractive for investors seeking new ideas).

**Main Application Pages:**

* **Matching:** A "Tinder-like" interface for users to swipe and match with other individuals.

* **Search:** A search bar with filters to find individuals based on specific criteria.

* **Workspace:** The project workspace area, accessible once co-founders agree to form a startup.

* **Chats:** A communication section where matched users can interact.

* **Profile:** User settings, allowing for resume uploads and basic configuration changes.

## Upstarter.Mobile

When defining React Native components for the Upstarter mobile application, please ensure that all components are implemented using functional components with the following structure:

```javascript
// Example: A simple button component

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

/**
 * Renders a customizable button.
 * @param {object} props - The component's properties.
 * @param {string} props.title - The text displayed on the button.
 * @param {function} props.onPress - The function to call when the button is pressed.
 * @param {object} [props.style] - Optional style object for the button container.
 * @param {object} [props.textStyle] - Optional style object for the button text.
 * @returns {JSX.Element} The Button component.
 */
const CustomButton = ({ title, onPress, style, textStyle }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    );
  };

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomButton;

// Example: A screen component

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Renders the main matching screen.
 * @returns {JSX.Element} The MatchingScreen component.
 */
const MatchingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Find Your Match!</Text>
      {/* Tinder-like matching UI would go here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default MatchingScreen;