# Personal Reviews
It's an app where you can save your reviews of products, services, experiences... or anything! You can rate an item in different aspects depending on the category they're associated with, for example for videogames you can rate plot, gameplay and graphics separately. Since your opinion can change over time, you can add multiple reviews to a single product and later see them in a timeline. Items can have an origin, which is where the item came from, for example, for a car its origin can be its brand.

<br>

## ⚙️ Initial Developer Setup

Make sure you have [Node.js](https://nodejs.org/en) version **21 or higher** installed.

Install all project dependencies:

```bash
npm install
```
<br>

Install [Ionic CLI](https://ionicframework.com/) globally:
```bash
npm i -g @ionic/cli
```

<br>

## 🔧 Android Setup
Make sure you have [Android Studio](https://developer.android.com/studio?hl=es-419) installed and properly configured.



Set up the Android platform by running:
```bash
npx cap add android
ionic build
npx cap sync android
```

<br>

Generate and sync media assets:
```bash
 npx @capacitor/assets generate
 npx cap sync
 ```

<br>

Open android studio:
```bash
npx cap open android
```

<br>

### 📱 Splash screen configurations
Modify file `/android/capacitor-android/res/values/colors.xml` in android studio and add this color:

```xml
<color name="my_launch_background">#222831</color>
```
<br>

## 🧠 Application Overview

The app is organized into three main sections: **Reviews**, **Items & Origins**, and **Categories**. Below is a detailed breakdown of all routes and their functionalities.

---

### 1. **Reviews** (`/app/reviews/`)

- `/app/reviews/`
  Main review page. Features:
  - View all reviews.
  - Search by name.
  - Filter and sort.

  <br>

- `/app/reviews/create`
  Create a new review with:
  - Ratings.
  - Comments.
  - Images.

  <br>

- `/app/reviews/:id/edit`
  Edit or delete an existing review. Fields are the same as in creation.

  <br>

- `/app/reviews/create/item/:itemId`
  Create a review for a specific item, with that item preselected.

---

### 2. **Items & Origins** (`/app/items/`)

- `/app/items/`
  View all items. Features:
  - Search by name.
  - Filter and sort.
  - Group by origins (hides items that are part of an origin).

<br>

- `/app/items/:id/viewItem`
  View item or origin details:
  - Timeline of reviews.
  - Item contents and images.
  - Toggle between item and origin view.
  - Delete the element.

<br>

- `/app/items/create`
  Create a new item or origin:
  - If it's an origin: add items inside.
  - If it's an item: assign it to an origin.

  <br>

- `/app/items/:id/edit`
  Edit an item or origin:
  - Toggle between item/origin types.
  - Same options as the create view.

---

### 3. **Categories** (`/app/more/categories/`)

- `/app/more/categories/`
  View all categories. Allows searching by name.

  <br>

- `/app/more/categories/create`
  Create a new category with:
  - Subcategories.
  - Associated ratings.

  <br>

- `/app/more/categories/:id/subcategories/create`
  Create a subcategory under a specific category.

  <br>

- `/app/more/categories/:id/edit`
  Edit a category or any of its subcategories.

---
