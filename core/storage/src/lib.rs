use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum StorageError {
    #[error("Db connection error: {0}")]
    Connection(String),
}

pub async fn initialize_pool(database_url: &str) -> Result<Pool<Sqlite>, StorageError> {
    SqlitePoolOptions::new()
        .max_connections(5)
        .connect(database_url)
        .await
        .map_err(|e| StorageError::Connection(e.to_string()))
}


