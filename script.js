// Constants
const API = "https://backend-of-blog.onrender.com/api";

// DOM Elements
const navItems = document.querySelectorAll(".nav-item");
const slider = document.querySelector(".slider");
const pages = document.querySelectorAll(".page");

const home = document.querySelector("#home");
const newPost = document.querySelector("#newPost");
const profile = document.querySelector("#profile");

const postContent = document.querySelector(".post-content");
const authForm = document.querySelector("#auth-form");
const toggleLink = document.querySelector("#toggleLink");
const subtext = document.querySelector(".subtext");

// Initial State
let isLogin = true;

// Page Utilities
function showPage(pageId) {
  pages.forEach((page) => {
    page.style.display = page.id === pageId ? "block" : "none";
  });
}

function activateNavItem(item) {
  navItems.forEach((i) => i.classList.remove("active"));
  item.classList.add("active");
  slider.style.left = `${item.offsetLeft}px`;
}

// DOM Load Handler
window.addEventListener("DOMContentLoaded", async () => {
  postContent.innerHTML = "";
  fetchAllPosts();

  const activeItem = document.querySelector(".nav-item.active");
  if (activeItem) {
    slider.style.left = `${activeItem.offsetLeft}px`;
    switch (activeItem.id) {
      case "home":
        showPage("homePage");
        break;
      case "newPost":
        showPage("newPostPage");
        break;
      case "profile": {
        const token = localStorage.getItem("token");
        showPage(token ? "userpage" : "profilePage");
        break;
      }
      default:
        showPage("homePage");
        activateNavItem(home);
    }
  } else {
    showPage("homePage");
    activateNavItem(home);
  }

  fetchUserPosts();
});

// Nav Event Listeners
home.addEventListener("click", () => {
  showPage("homePage");
  activateNavItem(home);
});

newPost.addEventListener("click", () => {
  showPage("newPostPage");
  activateNavItem(newPost);
});

profile.addEventListener("click", () => {
  activateNavItem(profile);
  const token = localStorage.getItem("token");
  showPage(token ? "userpage" : "profilePage");
  document.querySelector("footer").style.display = "none";
});

// Fetch All Posts with skeleton effect ------
async function fetchAllPosts() {
  const loader = document.querySelector("#postLoader");
  if (loader) loader.style.display = "block";
  try {
    const res = await fetch(`${API}/posts/all`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(`HTTP error! Status ${res.status}`);

    const data = await res.json();
    postContent.innerHTML = ""; // Clear existing posts
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    data.forEach((post) => {
      const date = new Date(post.date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const postCard = document.createElement("div");
      postCard.className = "post-card";

      postCard.innerHTML = `
        <div class="post-header">
        <div class="pic-username">
          <div class="profile-pic"></div>
          <p class="username">@${post.author}</p>
          ${
            post.author === "rehan"
              ? `<i class="fa-brands fa-bluesky fa-flip verify"></i>`
              : ""
          } </div>
        </div>
        <div class="post-body">
          <p class="post-text">
            ${post.content}
          </p>
        </div>
         <div>
          <p class="time"> · ${date}</p>
          </div>
        `;
      postContent.appendChild(postCard);
    });
  } catch (error) {
    console.error("Error fetching posts:", error.message);
  } finally {
    if (loader) loader.style.display = "none";
  }
}

// Toggle Login/Signup Form
if (authForm) {
  toggleLink.addEventListener("click", (e) => {
    e.preventDefault();
    isLogin = !isLogin;

    document.querySelector(".text").textContent = isLogin
      ? "Welcome Back 👋"
      : "Create an Account";
    subtext.textContent = isLogin
      ? "Log in to your blog account to continue."
      : "Join us and start sharing your thoughts.";
    document.querySelector("#btn").textContent = isLogin ? "Login" : "Sign up";
    document.querySelector(".switch").firstChild.textContent = isLogin
      ? "Don't have an account? "
      : "Already have an account? ";
    toggleLink.textContent = isLogin ? "Sign up" : "Login";
  });

  // Submit Login or Signup
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    const endpoint = isLogin ? "/login" : "/signup";

    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        document.querySelector(".errorMessage").textContent =
          errData.message || "Login failed.";
        return;
      }
      document.querySelector("#username").value = "";
      document.querySelector("#password").value = "";
      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("author", data.username);

      showPage("userpage");
      fetchUserPosts();
    } catch (error) {
      document.querySelector(".errorMessage").textContent =
        "Something went wrong. Try again.";
    }
  });
}
const token = localStorage.getItem("token");

// Fetch Authenticated User Posts
async function fetchUserPosts() {
  const username = localStorage.getItem("author");

  if (!token || !username) return;
  const usernameDisplay = document.querySelector(".login-username");
  usernameDisplay.textContent = `${username}`;
  try {
    const res = await fetch(`${API}/posts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const posts = await res.json();
    if (posts.message === "Add blog") {
      return console.log(posts.message);
    }

    const userPostsContainer = document.querySelector(".user-posts");

    if (userPostsContainer) {
      userPostsContainer.innerHTML = ""; // Clear previous posts
      posts.forEach((post) => {
        const card = document.createElement("div");
        card.className = "post-card";
        card.innerHTML = `
          <div class="post-header">
          <div class="pic-username">
            <div class="profile-pic"></div>
            <p class="username">${post.author}</p>
              <p class="time"> · ${new Date(post.date).toLocaleDateString(
                "en-US",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              )}</p> </div>
              <div>
             <div class="dots" data-id="${
               post._id
             }"> <i class="fa-solid fa-trash"></i> </div>
              </div>
          </div>
          <div class="post-body">
            <p class="post-text">${post.content || posts.message}</p>
          </div>
        `;
        const dots = card.querySelector(".dots");
        dots.addEventListener("click", async () => {
          const deleteBox = document.querySelector(".delete-opt");
          const deleteNo = document.querySelector("#no");
          const deleteYes = document.querySelector("#yes");
          deleteBox.style.display = "flex";
          deleteNo.addEventListener("click", () => {
            deleteBox.style.display = "none";
          });
          deleteYes.addEventListener("click", async () => {
            const res = await fetch(`${API}/posts/${dots.dataset.id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
            if (res.ok) {
              card.remove();
              deleteBox.style.display = "none";
            }
          });
        });
        userPostsContainer.appendChild(card);
      });
    }
  } catch (error) {
    console.error("Failed to fetch user posts:", error.message);
  }
}

//logout logic
const post_form = document.querySelector("#post-form");
const logoutBtn = document.querySelector(".logoutBtn");

logoutBtn.addEventListener("click", () => {
  // Remove user session data
  localStorage.removeItem("token");
  localStorage.removeItem("author");

  // Reset view to public homepage
  showPage("homePage");
  activateNavItem(home);
  post_form.style.display = "none";

  // Clear user-specific content if needed
  const userPostsContainer = document.querySelector(".user-posts");
  if (userPostsContainer) userPostsContainer.innerHTML = "";

  // Refresh public posts
  fetchAllPosts();
});

// create new post
// const token = localStorage.getItem("token");
const createError = document.querySelector(".create-error");

if (!token) {
  post_form.style.display = "none";
  document.querySelector(".login-first").innerHTML = "Login first!";
}
if (post_form) {
  const createBtn = document.querySelector(".create-Btn");
  createBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const title = document.querySelector("#title").value;
    const content = document.querySelector("#content").value;
    if (!title || !content) {
      return (createError.innerHTML = "add title and content to post");
    }
    if (title.length < 5) {
      return (createError.innerHTML = "Title should be more than 5 char");
    }
    if (content.length < 15) {
      return (createError.innerHTML = "content should be more than 15 char");
    }
    try {
      const res = await fetch(`${API}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) {
        createError.textContent = "Try Again";
        return;
      }
      showPage("homePage");
      activateNavItem(home);
      fetchAllPosts();
      post_form.style.display = "block";
      createError.textContent = "";
      document.querySelector("#title").value = "";
      document.querySelector("#content").value = "";
      const data = await res.json();
      console.log(data.message);
    } catch (error) {
      console.error(error);
    }
  });
}
