# Lanka Agri-Direct Mobile App - Workflow Diagrams & Processes

## 1. Complete Application Flow

### 1.1 App Initialization Sequence

```
App Starts
    │
    ▼
┌──────────────────────────────────┐
│ App.tsx Renders                  │
│ 1. SafeAreaProvider wraps UI     │
│ 2. AuthProvider context mounted  │
│ 3. NavigationContainer setup     │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ AuthContext.restoreSession()         │
│ 1. Check AsyncStorage for JWT       │
│ 2. Check AsyncStorage for user data │
└──────┬───────────────────────────────┘
       │
       ├─── Token & User Found ───┐
       │                           │
       │                    ┌──────▼──────┐
       │                    │ Set user    │
       │                    │ Set token   │
       │                    │ loading=off │
       │                    └──────┬──────┘
       │                           │
       │    ┌──────────────────────┘
       │    │
       │    ▼
       │  ┌─────────────────────┐
       │  │ AppNavigator        │
       │  │ (Check user.role)   │
       │  └──────┬──────────────┘
       │         │
       │    ┌────┴─────────┬──────────┐
       │    │              │          │
       │    ▼              ▼          ▼
       │  BUYER         PRODUCER    ADMIN
       │    │              │          │
       │    ▼              ▼          ▼
       │  BuyerNav    ProducerNav  AdminNav
       │
       │
       ├─── Token Expired/Invalid ───┐
       │                              │
       │                       ┌──────▼──────┐
       │                       │ Show Login  │
       │                       │ Set loading │
       │                       │ = false     │
       │                       └─────────────┘
       │
       │
       └─── No Token Found ────┐
                                │
                          ┌─────▼──────┐
                          │ Show Auth  │
                          │ Stack      │
                          │ (Login +   │
                          │ Register)  │
                          └────────────┘
```

---

## 2. Buyer User Workflows (Detailed)

### 2.1 Browse & Discovery Flow

```
┌─────────────────────────────────┐
│   Buyer Opens App               │
│   View: BuyerNavigator          │
│   - Bottom Tab: Browse/Saved     │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│   HomeScreen (Browse Tab - Initial Load)    │
│                                             │
│   1. Fetch GET /products?page=1             │
│   2. Display product grid                  │
│   3. Show categories (picker/filter)       │
│   4. Search input at top                   │
└────────────┬────────────────────────────────┘
             │
    ┌────────┼────────┐
    │        │        │
    ▼        ▼        ▼
 Search   Filter   Scroll
   │        │        │
   │        │    ┌───▼────┐
   │        │    │ Reach  │
   │        │    │ bottom │
   │        │    └───┬────┘
   │        │        │
   │        │    ┌───▼──────────────┐
   │        │    │ Fetch next page  │
   │        │    │ GET /products?page=2
   │        │    └───┬──────────────┘
   │        │        │
   │     ┌──┴────────┴──┐
   │     │               │
   │     ▼               ▼
   │  ┌────────────┐  ┌────────────┐
   │  │ Filter by │  │ Pagination │
   │  │ category  │  │ (append)   │
   │  └────┬───────┘  └────────────┘
   │       │
   └───────┼──────────┐
           │          │
           ▼          ▼
    ┌──────────────────┐
    │ ProductCard Taps │
    │ (user clicks)    │
    └────────┬─────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│   ProductDetailScreen Navigates            │
│   PARAMS: productId                        │
│                                            │
│   1. Fetch GET /products/{productId}       │
│   2. Extract producer info                 │
│   3. Render Product Details                │
│      - Product image (responsive 280px)   │
│      - Price & unit                        │
│      - Description                         │
│      - Category                            │
│      - Rating (if available)               │
└────────┬─────────────────────────────────────┘
         │
    ┌────┴────┬────────┬──────────┐
    │         │        │          │
    ▼         ▼        ▼          ▼
  Call    Map View  Profile   Bookmark
    │         │        │          │
    │         │        │    ┌─────▼─────┐
    │         │        │    │ Toggle    │
    │         │        │    │ Bookmark  │
    │         │        │    │ AsyncStor │
    │         │        │    │ age       │
    │         │        │    └───────────┘
    │         │        │
    │         │    ┌───▼──────────────┐
    │         │    │ Navigate to      │
    │         │    │ ProducerDetail   │
    │         │    │ PARAMS:          │
    │         │    │ producerId       │
    │         │    └────┬─────────────┘
    │         │         │
    │         │    ┌────▼──────────────────┐
    │         │    │ ProducerDetailScreen  │
    │         │    │ 1. Fetch producer     │
    │         │    │ 2. Fetch products     │
    │         │    │ 3. Show all details   │
    │         │    │ 4. Contact options   │
    │         │    └───────────────────────┘
    │         │
    │    ┌────▼────────────────────┐
    │    │ POST /analytics/        │
    │    │ address-view            │
    │    │ Track: producerId,      │
    │    │ buyerDeviceId,          │
    │    │ timestamp               │
    │    └────┬───────────────────┘
    │         │
    │    ┌────▼──────────────┐
    │    │ Platform check    │
    │    │ iOS/Android→geo:  │
    │    │ Web→Google Maps   │
    │    │ Linking.openURL() │
    │    └──────────────────┘
    │
    ▼
┌──────────────────────┐
│ POST /analytics/call │
│ Track: producerId,   │
│ actionType: "call"   │
│ Linking.openURL()    │
│ 'tel:...'            │
└──────────────────────┘
```

### 2.2 Bookmarks Management Flow

```
┌────────────────────────────────────┐
│  Tap Bookmarks Tab                 │
│  View: BookmarksScreen             │
└─────────────┬──────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│  BookmarksScreen                     │
│  Read bookmarks from AsyncStorage    │
│  BOOKMARKS_KEY: [productId...]       │
│  Display: Saved Producer List        │
└────────────┬─────────────────────────┘
             │
        ┌────┴────────┐
        │             │
    Empty List     Has Items
        │             │
        ▼             ▼
   ┌────────┐   ┌──────────────────┐
   │ "No    │   │ Render producer  │
   │ saved  │   │ list with:       │
   │producers"   │ - Photo          │
   └────────┘   │ - Store name     │
               │ - Contact info   │
               └────────┬─────────┘
                        │
                ┌───────┴───────┐
                │               │
            Tap Item          Bookmark
                │             Toggle ★
                │               │
             ┌──▼────────────┐  │
             │ Navigate to   │  │
             │ ProducerDetail│  │
             │ Screen        │  │
             └───────────────┘  │
                                │
                          ┌─────▼──────────┐
                          │ Remove from    │
                          │ AsyncStorage   │
                          │ BOOKMARKS_KEY  │
                          │ Refresh list   │
                          └────────────────┘
```

---

## 3. Producer User Workflows (Detailed)

### 3.1 Registration & Onboarding

```
┌────────────────────────────────────────┐
│  Unauthenticated User on LoginScreen   │
│  Tap: "Create Account"                 │
└─────────────┬────────────────────────────┘
              │
              ▼
┌ ────────────────────────────────────────┐
│  RegisterScreen (Producer Registration) │
│  Multi-step form                        │
└─────────────┬────────────────────────────┘
              │
    ┌─────────┼─────────────┐
    │         │             │
    ▼         ▼             ▼
 Step 1    Step 2        Step 3
   │         │             │
   │    ┌────▼────────┐    │
   │    │             │    │
   │    │  Personal   │    │
   │    │  Info Form │    │
   │    │             │    │
   │    │ • Firstname │    │
   │    │ • Lastname  │    │
   │    │ • Email     │    │
   │    │ • Password  │    │
   │    │ • Phone     │    │
   │    │ • NIC       │    │
   │    └─────┬───────┘    │
   │          │            │
   │    ┌─────▼─────────┐   │
   │    │ NIC Photo     │   │
   │    │ Upload        │   │
   │    │ (Front & Back)│   │
   │    │ → Cloudinary  │   │
   │    └─────┬─────────┘   │
   │          │             │
   ▼          ▼             ▼
┌──────────────────────────────┐
│     Step 2: Business Info    │
│                              │
│ • Store Title                │
│ • Business Type Category     │
│ • Store Description          │
│ • Profile Photo Upload       │
│   → Cloudinary               │
└───┬────────────────────────┬─┘
    │                        │
    ▼                        ▼
┌────────────────────┐    ┌──────────────────┐
│ Step 3: Location   │    │ Validate Form    │
│                    │    │                  │
│ • Address          │    │ If Errors:       │
│ • District/Prov    │    │ • Show field     │
│ • GPS coords       │ ──►│   errors         │
│   (getLocation)    │    │ • Scroll to      │
│ • Operating Hours  │    │   first error    │
│   (Day selector +  │    │                  │
│    Time picker)    │    │ If Valid:        │
│                    │    │ • Proceed        │
└────────────────────┘    └────────┬─────────┘
                                   │
                            ┌──────▼─────────┐
                            │ Compile Data   │
                            │ POST /auth/    │
                            │ register/      │
                            │ producer       │
                            └────────┬──────┘
                                     │
                            ┌────────▼────────┐
                            │ Backend:        │
                            │ 1. Validate     │
                            │    data         │
                            │ 2. Hash passwd  │
                            │ 3. Create user  │
                            │ 4. Generate JWT │
                            │ 5. Return token │
                            │    + user data  │
                            └────────┬───────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                 Error                            Success
                    │                                 │
              ┌─────▼──────┐                  ┌──────▼──────┐
              │ Show error │                  │ Save JWT &  │
              │ message    │                  │ user to     │
              │ Retry form │                  │ AsyncStorage│
              └────────────┘                  └──────┬──────┘
                                                     │
                                              ┌──────▼──────────┐
                                              │ Update Auth     │
                                              │ Context         │
                                              │ user = {...}    │
                                              │ token = JWT     │
                                              └──────┬──────────┘
                                                     │
                                              ┌──────▼──────────┐
                                              │ AppNavigator    │
                                              │ re-renders      │
                                              │ user.role=      │
                                              │ "PRODUCER"      │
                                              └──────┬──────────┘
                                                     │
                                              ┌──────▼──────────┐
                                              │ Navigate to     │
                                              │ Dashboard       │
                                              │ Screen          │
                                              │ Verification    │
                                              │ Status: Pending │
                                              └─────────────────┘
```

### 3.2 Add Product Workflow

```
┌──────────────────────────────────┐
│  Producer TapMyProducts Tab       │
│  View: MyProductsScreen           │
└────────────┬─────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  MyProductsScreen                       │
│  1. Fetch GET /products/my-products     │
│  2. Display list of producer's products │
│  3. Show count & status                 │
└────────────┬────────────────────────────┘
             │
    ┌────────┼────────┬─────────┐
    │        │        │         │
    ▼        ▼        ▼         ▼
  Add      Edit    Delete      View
  Product  Product Product      All
  Tap ➕    Tap     Tap        Tap
  Button   Edit    Delete     Each

  │        │         │
  │        │    ┌────▼──────────────┐
  │        │    │ Confirm Dialog    │
  │        │    │ "Delete <prod>?"  │
  │        │    │ Cancel / Confirm  │
  │        │    └────┬──────────────┘
  │        │         │ Confirm
  │        │    ┌────▼──────────────┐
  │        │    │ DELETE /products/ │
  │        │    │ {id}              │
  │        │    │ Backend deletes   │
  │        │    │ from MongoDB      │
  │        │    └────┬──────────────┘
  │        │         │
  │        │    ┌────▼──────────────┐
  │        │    │ Refresh list     │
  │        │    │ Product removed  │
  │        │    └──────────────────┘
  │        │
  │    ┌───▼───────────────────┐
  │    │ AddProductScreen or   │
  │    │ Edit (pre-filled)     │
  │    └───┬───────────────────┘
  │        │
  └────────┼──────────┬─────────────────┐
           │          │                 │
    ┌──────▼──────┐   │                 │
    │ Product Form│   │                 │
    │             │   │                 │
    │ • Name      │   │                 │
    │ • Category ◀┼───┤ Category list   │
    │ • Price     │   │ [Vegetables,    │
    │ • Unit Type◀┼───┤  Fruits,        │
    │ • Unit ◀────┼───┤  Herbal,        │
    │ • Desc      │   │  Rice, Fish,    │
    │             │   │  Meat]          │
    │ • Image []  │   │                 │
    │   Upload ➕ │   │                 │
    └──────┬──────┘   │                 │
           │          └─────────────────┘
           │
    ┌──────▼────────────────────┐
    │ Tap Image Upload button   │
    │ Image picker opens        │
    └──────┬───────────────────┘
           │
    ┌──────▼────────────────────┐
    │ Select image from device  │
    │ Create FormData           │
    │ - Field: file             │
    │ - Value: imageFile        │
    │ - Upload Preset: <key>    │
    └──────┬───────────────────┘
           │
    ┌──────▼──────────────────┐
    │ POST to Cloudinary API  │
    │ Upload file             │
    └──────┬─────────────────┘
           │
    ┌──────▼────────────────────────────┐
    │ Cloudinary returns:                │
    │ {                                  │
    │   secure_url: "https://res.cloud.."│
    │   public_id: "...",                │
    │   version: 1234567890              │
    │ }                                  │
    └──────┬────────────────────────────┘
           │
    ┌──────▼────────────────────────────┐
    │ Store URL in form state            │
    │ Show preview of image              │
    │ Button: Remove image ✕             │
    └──────┬────────────────────────────┘
           │
    ┌──────▼──────────────────┐
    │ User fills remaining    │
    │ form fields             │
    │ Validates all fields    │
    └──────┬─────────────────┘
           │
    ┌──────▼──────────────────────────────┐
    │ Validation check                    │
    │ - Name not empty                    │
    │ - Price > 0                         │
    │ - Category selected                 │
    │ - Unit type selected                │
    └──────┬───────────────┬──────────────┘
           │               │
        ERROR           SUCCESS
           │               │
      ┌────▼─┐        ┌────▼──────┐
      │ Show │        │ POST /     │
      │ errs │        │ products   │
      │ Ret. │        │ Request    │
      └──────┘        │ body:      │
                      │ { name,    │
                      │   catego.., │
                      │   price,   │
                      │   image,   │
                      │   ...}     │
                      └────┬──────┘
                           │
                     ┌─────▼────────┐
                     │ Backend:     │
                     │ 1. Validate  │
                     │ 2. Save      │
                     │ 3. Return    │
                     │    product   │
                     │    data      │
                     └─────┬────────┘
                           │
                  ┌────────┴────────┐
                  │                 │
                Error           Success
                  │                 │
              ┌───▼──┐        ┌─────▼────────┐
              │Show  │        │ Refresh list │
              │error │        │ Show success │
              │ msg  │        │ "Product     │
              │ Ret. │        │ created!"    │
              └──────┘        │ Navigate to  │
                              │ MyProducts   │
                              └──────────────┘
```

### 3.3 Dashboard & Analytics Flow

```
┌──────────────────────────────────┐
│  Producer Opens App               │
│  AppNavigator detects:            │
│  role="PRODUCER"                  │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  ProducerNavigator               │
│  Stack Navigator                 │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  DashboardScreen (Initial Route)     │
│  1. Fetch GET /auth/me (get user)    │
│  2. Fetch GET /analytics/my-analytics│
│  3. Get last 30 days lead data       │
└────────────┬───────────────────────┘
             │
    ┌────────┼───────────┬──────────┐
    │        │           │          │
    ▼        ▼           ▼          ▼
 Ver Status Lead Card  Call Card   View Card
    │        │           │          │
    │   ┌────▼─────────┐ │     ┌────▼────────┐
    │   │ Total Leads  │ │     │ Address     │
    │   │ value        │ │     │ Views       │
    │   │ (calls+views)│ │     │ value       │
    │   │              │ │     │             │
    │   │ ← Tap to see │ │     │ ← Tap to    │
    │   │   breakdown  │ │     │   see list  │
    │   └────────────┬─┘ │     └─────────────┘
    │               │    │
    │   ┌───────────▼────┴────────┐
    │   │ Tap reveals list of     │
    │   │ calls today/week/month  │
    │   │ - Producer name         │
    │   │ - Date/time             │
    │   │ - Action (call/location)│
    │   └────────────────────────┘
    │
    ├─ Pending ──────────────┐
    │ (Awaiting KYC approval)│
    │ Yellow banner          │
    │ "Pending verification" │
    ├─ Verified ─────────────┤
    │ ✓ Checkmark            │
    │ Green status badge     │
    │ "Verification expired" │
    └─ Blocked ──────────────┤
      (Admin blocked         │
       account)             │
      Red status badge      │
      "Account blocked"     │
      Cannot sell products  │
      └──────────────────────┘

    Navigation Menu (Tap):
    ├─◆ Dashboard (current)
    ├─ My Products
    ├─ ➕ Add Product
    └─ ⚙️ Settings

    ┌────────────────────┐
    │ ⚙️ Settings Tap     │
    └─────────┬──────────┘
              │
         ┌────▼──────────────────┐
         │ AccountSettingsScreen │
         │                       │
         │ Edit Fields:          │
         │ • Store Title         │
         │ • Phone number        │
         │ • Email               │
         │ • Profile picture     │
         │ • Location            │
         │ • Operating hours     │
         │   (DaySelector +      │
         │    TimeInput)         │
         │ • Password            │
         │                       │
         │ • Save changes button │
         │ • Logout button       │
         │ • Delete account      │
         └────┬──────────────────┘
              │
          ┌───┴────────┐
          │            │
       Save         Delete
          │            │
   ┌──────▼──────┐ ┌──▼─────────┐
   │ PUT /auth/  │ │ Confirm    │
   │ profile     │ │ dialog     │
   │ Update      │ │ sure?      │
   │ backend     │ │            │
   │ Update      │ │ Confirm    │
   │ AuthContext │ │ DELETE    │
   │ Success!    │ │ /auth/    │
   └─────────────┘ │ profile   │
                   │ Clear auth│
                   │ Logout    │
                   └───────────┘
```

---

## 4. Authentication & Session Management

### 4.1 Login Flow Sequence

```
┌────────────────────────────────────┐
│  User enters email + password      │
│  Tap Login button                  │
└─────────────┬──────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Client-side validation                 │
│  - Email format check                   │
│  - Password not empty                   │
└─────────────┬───────────────────┬──────┘
              │                   │
            Valid              Invalid
              │                   │
              │              ┌────▼────┐
              │              │ Show    │
              │              │ errors  │
              │              │ (red)   │
              │              └─────────┘
              │
              ▼
┌──────────────────────────────────┐
│  POST /auth/login                │
│  {                               │
│    email: user@example.com,      │
│    password: hashedPassword      │
│  }                               │
└──────────┬──────────────────────┘
           │
    ┌──────▼────────────────────┐
    │ Backend process:          │
    │ 1. Find user by email    │
    │ 2. Hash & compare passwd  │
    │ 3. Generate JWT token     │
    │ 4. Return success         │
    └──────┬───────────────────┘
           │
    ┌──────┴────────┬──────────────┐
    │               │              │
 Invalid         Valid         Error
  User          Auth           (500)
    │               │              │
┌───▼──┐    ┌───────▼────────┐ ┌──▼──┐
│ Show │    │ Response:      │ │Show │
│"User │    │ {              │ │"Err │
│not   │    │  token: JWT,   │ │or"  │
│found"│    │  user: {...}   │ │Ret. │
│Ret. │    │ }              │ └─────┘
└─────┘    └───────┬────────┘
                   │
            ┌──────▼──────────────────┐
            │ Save to AsyncStorage    │
            │ auth_token = JWT        │
            │ auth_user = user data   │
            │ (JSON stringified)      │
            └──────┬─────────────────┘
                   │
            ┌──────▼──────────────────┐
            │ Update AuthContext      │
            │ setToken(JWT)           │
            │ setUser(userData)       │
            │ setLoading(false)       │
            └──────┬─────────────────┘
                   │
            ┌──────▼──────────────────┐
            │ AppNavigator detects    │
            │ user !== null           │
            │ Checks user.role        │
            └──────┬─────────────────┘
                   │
            ┌──────▼──────────────────┐
            │ Routes to appropriate   │
            │ navigator:              │
            │ - BuyerNavigator        │
            │ - ProducerNavigator     │
            │ - AdminNavigator        │
            └──────────────────────────┘
```

### 4.2 Session Restoration on App Launch

```
┌─────────────────────────────┐
│  App Launches               │
│  AuthContext.JSX            │
│  useEffect({[]})  runs      │
└────────────┬────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  restoreSession() function         │
│  1. setLoading(true)               │
│  2. try:                           │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  AsyncStorage.getItem('auth_token')│
└────┬───────────────────────┬───────┘
     │                       │
  Found                  Not Found
     │                       │
┌────▼───┐            ┌──────▼─────┐
│ Verify │            │ Skip (no   │
│ stored │            │ session)   │
│ token  │            └──────┬─────┘
│ still  │                   │
│ valid? │            ┌──────▼──────────┐
└────┬───┘            │ setLoading(false)
     │                │ (App shows Auth │
  ┌──┴──┐             │ Stack)          │
  │     │             └─────────────────┘
Yes   No
  │    │
  │ ┌──▼──────┐
  │ │ Token   │
  │ │ expired │
  │ └──┬──────┘
  │    │
  │ ┌──▼──────────────────────┐
  │ │ setLoading(false)       │
  │ │ (Show Login screen)     │
  │ │ User must login again   │
  │ └────────────────────────┘
  │
  ▼
┌────────────────────────────────────┐
│ AsyncStorage.getItem('auth_user')  │
│ Parse JSON                         │
└────────┬────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ setUser(parsedUser)                │
│ setToken(authToken)                │
│ setLoading(false)                  │
└────────┬────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ AppNavigator re-renders            │
│ Checks user !== null               │
│ Routes to correct navigator        │
│ User back in session!              │
│ NO re-login required!              │
└────────────────────────────────────┘
```

---

## 5. API Request Flow with Authentication

```
┌────────────────────────────────────┐
│  Developer calls API                │
│  e.g., getProducts()               │
│  Returns: axiosInstance.get(...)   │
└─────────────┬──────────────────────┘
              │
              ▼
┌───────────────────────────────────────────┐
│  Axios Request Interceptor triggers       │
│  (Auto-attach JWT token)                  │
└─────────────┬──────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────┐
│  Read from AsyncStorage                    │
│  const token = await                       │
│    AsyncStorage.getItem('auth_token')     │
└─────────────┬──────────────────────────────┘
              │
        ┌─────┴─────┐
        │           │
     Found      Not Found
        │           │
   ┌────▼────┐   ┌──▼──┐
   │ Add to  │   │Skip │
   │ headers:│   │(no │
   │ Auth:   │   │token│
   │ Bearer  │   │in  │
   │ JWT     │   │requ│
   └────┬────┘   └─────┘
        │
   ┌────▼────────────────────────┐
   │ config.headers.Auth = ...    │
   │ return config                │
   └────┬───────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│  axios sends HTTP request            │
│  GET /api/v1/products?page=1         │
│  Header: {                           │
│    Authorization: "Bearer JWT..."    │
│  }                                   │
└──────────┬───────────────────────────┘
           │
    ┌──────▼──────┐
    │  Backend    │
    │  Processing │
    │  1. Verify  │
    │  2. Extract │
    │  3. Execute │
    │  4. Return  │
    │  Result     │
    └──────┬──────┘
           │
    ┌──────▼──────────────────────────┐
    │ HTTP Response                    │
    │ Status: 200/400/401/500         │
    └──────┬───────────────────────────┘
           │
    ┌──────┴────┬─────┬────────┬──────┐
    │           │     │        │      │
   200        400   401      500    Other
    │           │     │        │      │
 Success    Bad   Unauth.    Error  Error
    │       Req.   (Token)    (500)
    │       (Inv) (Expired)
    │       │     │        │
    │   ┌───▼─┐┌──▼─┐  ┌───▼──┐
    │   │Show │Show │  │Show  │
    │   │error error   │error │
    │   │msg  reload  │retry │
    │   └─────┘login  └──────┘
    │        └──────┘
    │
    ▼
┌─────────────────────────────────┐
│ Axios Response Interceptor      │
│ (Error handling)                │
│ if (status === 401) {           │
│   Redirect to Login             │
│   Clear AsyncStorage (token)    │
│   Alert: "Session expired"      │
│ }                               │
└─────────────────────────────────┘
```

---

## 6. Data Flow Diagrams

### 6.1 Product Card Component Data Flow

```
┌─────────────────────┐
│  HomeScreen         │
│  Renders product    │
│  list in FlatList   │
└────────────┬────────┘
             │
             ▼
┌──────────────────────────────────┐
│  ProductCard Component           │
│  PROPS: {                        │
│    id, name, image, price,       │
│    onPress, category             │
│  }                               │
└───────────┬──────────────────────┘
            │
       ┌────┴────┬───────┬─────────┐
       │         │       │         │
       ▼         ▼       ▼         ▼
    Image    Name    Price      Category
 (Responsive (Text) (Text)        (Badge)
  280px h)    │       │            │
       │      │       │            │
       ▼      ▼       ▼            ▼
    ┌──────────────────────────────┐
    │  TouchableOpacity wrapper    │
    │  onPress → navigate          │
    │  to ProductDetail screen     │
    └──────────────────────────────┘
```

### 6.2 State Management Data Flow

```
┌──────────────────────────────┐
│  AuthContext Provider        │
│  (App root)                  │
│  Wraps entire app            │
└───────────┬──────────────────┘
            │
       ┌────┴────┬────────┬──────┐
       │         │        │      │
       ▼         ▼        ▼      ▼
  useReducer  useState useState AsyncStorage
     │           │        │         │
     ├─ User     ├─ Token ├─ Error ├─ JWT
     ├─ Role     ├─ ...   └────┬──┘  └─ User
     └─ Verify       │        Display   Data
                     ▼        in alerts
                ┌──────────────────┐
                │ Context Consumer │
                │ (Any component)  │
                │ const auth =     │
                │ useContext(Auth) │
                │ auth.user.role  │
                └──────────────────┘
```

---

## 7. Feature Interaction Matrix

| Feature | Buyer | Producer | Data Stored |
|---------|-------|----------|------------|
| Browse Products | ✅ | ✅ (View own) | MongoDB |
| Add Product | ❌ | ✅ | MongoDB + Cloudinary |
| Bookmark Producer | ✅ | ❌ | AsyncStorage (local) |
| View Analytics | ❌ | ✅ | MongoDB (backend tracks) |
| Contact Producer | ✅ | ❌ | Phone/Maps app |
| Edit Profile | ✅ | ✅ | MongoDB |
| Delete Account | ✅ | ✅ | MongoDB (soft delete) |
| View Orders | ❌ | ❌ | N/A (not implemented) |

---

## 8. Error Handling Patterns

```
┌────────────────────────────────────┐
│  API Call or User Action           │
└─────────────┬──────────────────────┘
              │
              ▼
        ┌─────────────┐
        │  Try Block  │
        └─────┬───────┘
              │
      ┌───────┴───────┐
      │               │
   Success         Error
      │               │
      ▼               ▼
   Handle         ┌─────────────────┐
   Response       │ Catch Block     │
(Update State)    │ Extract message │
      │           └────┬────────────┘
      │                │
      │           ┌────▼──────────────┐
      │           │ Display AlertBox  │
      │           │ type="error"      │
      │           │ message={error}   │
      │           └────┬──────────────┘
      │                │
      │           ┌────▼──────────────┐
      │           │ User sees error   │
      │           │ Can retry         │
      │           │ or navigate away  │
      │           └────────────────────┘
      │
      └──────────────┬─────────────────┐
                     │                 │
                Finally Block          │
                     │                 │
              ┌──────▼──────────┐      │
              │ setLoading(false)│      │
              │ Reset form state│      │
              │ Hide spinner    │      │
              └─────────────────┘      │
                                       ▼
                            ┌──────────────────┐
                            │ Component ready  │
                            │ for new input    │
                            └──────────────────┘
```

---

## Summary of Workflows

✅ **Complete User Journeys Covered:**
1. App initialization → Authentication
2. Buyer: Browse → Discover → Contact → Bookmark
3. Producer: Register → Verify → Manage → Analyze
4. Session restoration → Persistent login
5. Image upload → Cloudinary → Storage
6. Error handling → User feedback

This workflow documentation complements the main analysis document and provides detailed step-by-step processes for all critical user interactions.
